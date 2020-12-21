'use strict';
const quizData = require('../models/interactiveQuizData');
const logger = require('../config/logger');
const quizDataValidation = require('../utils/payloadValidationOfQuizData');

async function createQuizData(req, res) {
    const createDataValue = req.body;
    console.log(createDataValue);
    try {
        if (!req.body || Object.keys(req.body).length === 0 && req.body.constructor === Object) {
            res.status(200).send("Error ! Empty data should not be used");
        } else {
            const quizValidation = await quizDataValidation.payloadValidationOfQuizData(createDataValue);
            if (quizValidation.success) {
                await quizData.collection.insertOne(createDataValue);
                res.status(200).send({ message: "Data Added Successfully" });
            } else {
                res.status(404).send({ message: `${quizValidation.message}` });
            }
        }
    } catch (err) {
        logger.error({ topic: 'Adding Quiz Data', message: `${err}` });
        res.status(500).send(err);
    }
}

module.exports = { createQuizData }