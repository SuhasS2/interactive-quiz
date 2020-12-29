'use strict';

const quizQuestionAnswer = require('../model/interactiveQuizData');

async function readQuizData(req, res) {
    try {
        var getQuizData = {};
        const getMcqQuestion = await quizQuestionAnswer.find({'question.questionType' : {$in : ['MCQ']}}).limit(5).skip(1);
        const getTfQuestion = await quizQuestionAnswer.find({'question.questionType' : {$in : ['T/F']}}).limit(5).skip(1);
        getQuizData = {getMcqQuestion,getTfQuestion};
        res.status(200).send(getQuizData);
    } catch (err) {
        console.log(err);
    }
}

module.exports = { readQuizData }; 