require('dotenv').config();
const { Telegraf } = require('telegraf');

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!telegramBotToken || !geminiApiKey) {
  console.error('Telegram Bot Token and Gemini API Key must be set in the .env file.');
  process.exit(1);
}

const bot = new Telegraf(telegramBotToken);

bot.start((ctx) => {
  ctx.reply('Welcome! I am MemeX Gemini, ready to answer your questions.');
});

bot.on('message', async (ctx) => {
  if (ctx.message.text && (ctx.message.text.startsWith('Memex') || ctx.message.text.includes('@MemeXGeminiBot'))) {
    const question = ctx.message.text.replace('Memex', '').replace('@MemeXGeminiBot', '').trim();

    if (question) {
      try {
        console.log('Question received:', question);
        const geminiResponse = await askGemini(question);
        console.log('Gemini response:', geminiResponse);
        ctx.reply(geminiResponse);
      } catch (error) {
        console.error('Error communicating with Gemini:', error);
        ctx.reply('Sorry, I encountered an error while processing your request.');
      }
    } else {
      ctx.reply('Please provide a question after mentioning Memex or tagging me.');
    }
  }
});

async function askGemini(question) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
  const data = {
    contents: [{
      parts: [{ text: question }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log('Gemini API response:', json);
    if (json.candidates && json.candidates.length > 0 && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts.length > 0) {
      return json.candidates[0].content.parts[0].text;
    } else {
      return 'Gemini could not provide an answer for this question.';
    }
  } catch (error) {
    console.error('Error in askGemini:', error);
    throw error;
  }
}

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
