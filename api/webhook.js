import MistralClient from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const mistralClient = new MistralClient(apiKey);

export default async function handler(request, response) {
  console.log('1. Webhook received a request');

  if (request.method !== 'POST') {
    console.log('2. Method not allowed');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('3. Request body:', request.body);
    const { message } = request.body;

    if (!message) {
      console.log('4. Invalid request body - message is missing');
      return response.status(400).json({ error: 'Invalid message format' });
    }

    if (!message.text) {
      console.log('5. Invalid request body - message text is missing');
      return response.status(400).json({ error: 'Invalid message format' });
    }

    console.log('6. Received message:', message);

    if (message.text === '/start') {
      console.log('7. Received /start command');
      const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const responseBody = {
        chat_id: message.chat.id,
        text: 'Welcome! How can I help you today?',
        reply_to_message_id: message.message_id,
      };

      console.log('8. Sending message:', responseBody);

      try {
        const telegramResponse = await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(responseBody),
        });

        console.log('9. Telegram API response status:', telegramResponse.status);

        if (!telegramResponse.ok) {
          const errorBody = await telegramResponse.text();
          console.error('10. Telegram API error:', telegramResponse.status, errorBody);
          console.error('Full Telegram API response:', telegramResponse); // Added logging for full response
          return response.status(500).json({ error: 'Failed to send message to Telegram' });
        }

        const telegramData = await telegramResponse.json();
        console.log('11. Telegram API response data:', telegramData);
        return response.status(200).json({ ok: true });
      } catch (telegramError) {
        console.error('12. Error sending message to Telegram:', telegramError);
        return response.status(500).json({ error: 'Failed to send message to Telegram' });
      }
    }

    const isDirectQuestion = message.text.startsWith('?');
    const isBotMentioned = message.entities?.some(
      entity => entity.type === 'mention' && entity.text.includes('@MemeX_Gemini_Bot')
    );

    if (!isDirectQuestion && !isBotMentioned) {
      console.log('13. Not a direct question or bot mention');
      return response.status(200).json({ ok: true });
    }

    let question = message.text
      .replace(/@MemeX_Gemini_Bot/g, '')
      .replace(/^\?/, '')
      .trim();

    console.log('14. Question to Mistral:', question);

    // Use Mistral AI to generate a response
    const chatStreamResult = await mistralClient.chat({
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: question }],
    });

    const answer = chatStreamResult.choices[0].message.content;

    console.log('15. Mistral AI answer:', answer);

    const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      const telegramResponse = await fetch(TELEGRAM_API, {
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

      console.log('16. Telegram API response status:', telegramResponse.status);

      if (!telegramResponse.ok) {
        const errorBody = await telegramResponse.text();
        console.error('17. Telegram API error:', telegramResponse.status, errorBody);
        return response.status(500).json({ error: 'Failed to send message to Telegram' });
      }

      console.log('18. Message sent to Telegram');
      return response.status(200).json({ ok: true });
    } catch (telegramError) {
      console.error('19. Error sending message to Telegram:', telegramError);
      return response.status(500).json({ error: 'Failed to send message to Telegram' });
    }
  } catch (error) {
    console.error('20. Error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
