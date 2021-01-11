'use strict';

const quizQuestionAnswer = require('../model/interactiveQuizData');
const logger = require('../config/logger');
const url = require('url');
const gconst = require('../globalConstants');

/**
 *
 * @param {Object} req
 * @param {Object} res
 * Description: getting quiz data
 */

async function readQuizData(req, res) {
    try {
        console.log(req.query);
        if (!req.query.url || Object.keys(req.query).length !== 1 && req.query.constructor === Object) {
            console.log("hi there");
            res.status(400).send({ message: 'Invalid Payload' })
        } else {
            const pathExtension = url.parse(req.query.url);
            console.log(pathExtension.pathname);
            const uniqueCollection = await quizQuestionAnswer.collection.distinct('question.questionType');
            let quizFullQuestions = [];
            for (let i = 0; i < uniqueCollection.length; i++) {
                let quizQuestions = await quizQuestionAnswer.find({ $and: [{ url: pathExtension.pathname }, {active : {$ne : false}}, { 'question.questionType': uniqueCollection[i] }] }).limit(process.env.TOTAL_QUESTIONS/uniqueCollection.length);
                for (let j in quizQuestions) { quizFullQuestions.push(quizQuestions[j]) }
            }
            quizFullQuestions.sort((a,b) => parseInt(a.questionNumber)-parseInt(b.questionNumber));
            logger.info({ topic: 'Get Quiz Details', message: 'Quiz Data Fetched successfully' })
            res.status(200).send({ data: quizFullQuestions, minCorrectAnswers: parseInt(process.env.MINIMUM_CORRECT_ANSWERS), quizTitle: gconst.quizTitleIs, passMessage: gconst.passMessageIs, failMessage: gconst.failMessageIs });
        }
    } catch (err) {
        logger.error({ topic: 'Something went wrong', message: `${err}` });
        res.status(500).send({ message: `${err}` });
    }
}

module.exports = { readQuizData };