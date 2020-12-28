'use strict';

const quizQuestionAnswer = require('../models/interactiveQuizData');

async function readQuizData(req, res) {
    try {
        const dbCollectionSize = await quizQuestionAnswer.collection.countDocuments({});
        console.log(dbCollectionSize);
        const skipVal = 4 //(dbCollectionSize)/3;
        console.log(skipVal);
        const getQuizData = await quizQuestionAnswer.find({'question.questionType' : {$in : ['MCQ','T/F']}}).limit(3).skip(skipVal).sort(-1);
        //const getQuizData = await quizQuestionAnswer.aggregate([{$match : {'question.questionType' : {$in : ['MCQ','T/F']}}}, {$skip : 2}])
        res.status(200).send(getQuizData);
        console.log("Reading Data", getQuizData);
    } catch (err) {
        console.log(err);
    }
}

module.exports = { readQuizData }; 