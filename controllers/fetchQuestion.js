'use strict';

const quizQuestionAnswer = require('../model/interactiveQuizData');
const logger = require('../config/logger');

async function readQuizData(req, res) {
    try {
        if (!req.body) {
            res.status(400).send({ message: 'Request Body is empty' })
        } else {
            const { pathExtension } = req.params;
            console.log("Path Name is : ", pathExtension);
            const collectionSize = await quizQuestionAnswer.collection.countDocuments({});
            for (let i = 0; i < 5;) {
                const questionNum = Math.floor((Math.random() * collectionSize) + 1);
                console.log(questionNum);
                const quizMCQQuestionAndAnswer = await quizQuestionAnswer.find({$and : [{url : pathExtension} , {questionNumber : questionNum} , {'question.questionType' : `${process.env.QUESTION_TYPE1}`}]});
                
                if(quizMCQQuestionAndAnswer.length > 0 ){
                    console.log(quizMCQQuestionAndAnswer);
                    return quizMCQQuestionAndAnswer;
                    i++;
                } else{i=i;}
            }
            for (let i = 0; i < 1;) {
                const questionNum = Math.floor((Math.random() * collectionSize) + 1);
                const quizTFQuestionAndAnswer = await quizQuestionAnswer.find({$and : [{url : pathExtension} , {questionNumber : questionNum} , {'question.questionType' : `${process.env.QUESTION_TYPE2}`} ]});
                console.log(quizTFQuestionAndAnswer);
                if(quizTFQuestionAndAnswer.length > 0){
                    return quizTFQuestionAndAnswer;
                    i++;
                } else{i=i;}
            }
            res.status(200).send({ message: 'Quiz Data Fetched successfully' });
        }
    } catch (err) {
        logger.error({ topic: 'Something went wrong', message: `${err}` });
        res.status(500).send({ message: `${err}` });
    }
}

module.exports = { readQuizData };
