import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = request.body;
    
    // Check if it's a valid message
    if (!message || !message.text) {
      return response.status(400).json({ error: 'Invalid message format' });
    }

    // Check if the message is meant for the bot
    const isDirectQuestion = message.text.startsWith('?');
    const isBotMentioned = message.entities?.some(
      entity => entity.type === 'mention' && entity.text.includes('@MemeX_Gemini_Bot')
    );

    if (!isDirectQuestion && !isBotMentioned) {
      return response.status(200).json({ ok: true });
    }

    // Remove bot mention and question mark from the message
    let question = message.text
      .replace(/@MemeX_Gemini_Bot/g, '')
      .replace(/^\?/, '')
      .trim();

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(question);
    const response = await result.response;
    const answer = response.text();

    // Send response back to Telegram
    const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: answer,
        reply_to_message_id: message.message_id,
      }),
    });

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
