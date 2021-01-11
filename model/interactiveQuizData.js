'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interActiveQuiz = new Schema({
    quizName: String,
    questionNumber: Number,
    question: {
        questionPartOne: String,
        questionType: String
    },
    options: Array,
    optionListIn : String,
    answer: String,
    keyAnswer: String,
    correctAnswerResponseWord: String,
    correctAnswerResponse: String,
    wrongAnswerResponseWord: String,
    wrongAnswerResponse: String,
    activeStats :Boolean
});

module.exports = mongoose.model('interactivequizzes', interActiveQuiz);