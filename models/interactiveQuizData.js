'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interActiveQuiz = new Schema({
    name: String,
    questionNumber: Number,
    question: {
        questionPartOne: String,
        questionType: String
    },
    options: Array,
    answer: String,
    keyAnswer: String,
    correctAnswerResponseWord: String,
    correctAnswerResponse: String,
    wrongAnswerResponseWord: String,
    wrongAnswerResponse: String
});

module.exports = mongoose.model('interactivequizzes', interActiveQuiz);