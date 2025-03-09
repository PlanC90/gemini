import MistralClient from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const mistralClient = new MistralClient(apiKey);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = request.body;

    if (!message || !message.text) {
      return response.status(400).json({ error: 'Invalid message format' });
    }

    const isDirectQuestion = message.text.startsWith('?');
    const isBotMentioned = message.entities?.some(
      entity => entity.type === 'mention' && entity.text.includes('@MemeX_Gemini_Bot')
    );

    if (!isDirectQuestion && !isBotMentioned) {
      return response.status(200).json({ ok: true });
    }

    let question = message.text
      .replace(/@MemeX_Gemini_Bot/g, '')
      .replace(/^\?/, '')
      .trim();

    // Use Mistral AI to generate a response
    const chatStreamResult = await mistralClient.chat({
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: question }],
    });

    const answer = chatStreamResult.choices[0].message.content;

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
