'use strict';
const quizQuestionAnswer = require('../models/interactiveQuizData');

async function readQuizData(req, res) {
    try {
        const getQuizData = (await quizQuestionAnswer.find({}));
        res.status(200).send(getQuizData);
        console.log("Reading Data", getQuizData);
    } catch (err) {
        console.log(err);
    }
}

module.exports = { readQuizData };