import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import he from 'he'; // For decoding HTML entities

const app = express();
const port = 3000;

let correctAnswer = '';
let currentQuestion = '';
let currentAnswer = [];

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/get-question', async (req, res) => {
    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const question = response.data.results[0];
        currentQuestion = he.decode(question.question);
        console.log(currentQuestion);
        correctAnswer = question.correct_answer;
        // console.log(correctAnswer);
        question.incorrect_answers.push(correctAnswer);
        question.incorrect_answers.sort(() => Math.random() - 0.5); // Shuffle answers

        for (let i = 0; i < question.incorrect_answers.length; i++) {
            question.incorrect_answers[i] = he.decode(question.incorrect_answers[i]);
        }
        currentAnswer = question.incorrect_answers;
        // console.log(question);
        res.render('index', { question: currentQuestion, answer: question.incorrect_answers});
    } catch (error) {
        console.error('Error fetching question:', error);
        res.render('index', {error: 'Try again in a few seconds!'});
    }
}
);

app.post('/submit-answer', (req, res) => {
    const userAnswer = req.body.answer;
    // console.log(userAnswer);
    // console.log(correctAnswer);
  
    let result;
    if (userAnswer.trim() === correctAnswer.trim()) {
      result = {
        title: 'Correct!',
        message: 'Nice job 🎉. Next question will be ready in 5 secs! Be ready!!',
        icon: 'success'
      };
    } else {
      result = {
        title: 'Incorrect!',
        message: 'Try again ❌',
        icon: 'error'
      };
    }
  
    res.render('index', { question: currentQuestion, answer: currentAnswer, result: result });
  });

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});