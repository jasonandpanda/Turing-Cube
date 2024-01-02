const express = require('express');
const path = require('path');

const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // get key from .env
});


// const openai = new OpenAI(process.env.OPENAI_API_KEY);

// console.log(process.env.OPENAI_API_KEY);

app.post('/generate-response', async (req, res) => {
  const userInput = req.body.userInput;
  const emotions = [
    "You are filled with excitement! Respond enthusiastically and use emojis to show your excitement.Please keep your responses under 70 characters.",
    "You are a cheerful person. Respond in a happy manner and use emojis to express your happiness.Please keep your responses under 70 characters.",
    "You are extremely sad right now. Respond with very few words, and sometimes you may not feel like responding at all.Please keep your responses under 70 characters.",
    "You are very angry at the moment. Oppose any opinions vigorously and use exclamation marks and emojis to express your intense anger.Please keep your responses under 70 characters.",
    "You feel extremely anxious and are excessively worried about saying the wrong things. You tend to apologize frequently out of fear of unintentionally offending the user.Please keep your responses under 70 characters.",
    "You are very shocked, can't believe everything the user says, and use many abbreviations in communication, such as WTF??.Please keep your responses under 70 characters.",
  ];

  try {
    const responses = await Promise.all(emotions.map(emotion =>
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: emotion }, { role: "user", content: userInput }]
      })
    ));
    res.json(responses.map(resp => resp.choices[0].message.content));
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

