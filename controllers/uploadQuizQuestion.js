'use strict';

const formidable = require('formidable');
const logger = require('../config/logger');
const path = require('path');
const csvtojsonV2 = require('csvtojson');
const payloadValidation = require('../utils/payloadValidationOfQuizData');
const quizModel = require('../models/interactiveQuizData');

async function quizDataCreation(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => { // to get form data 
        console.log('file value', files.file.name);
        const ext = path.extname(files.file.name);
        console.log(ext);
        console.log(files.file.size);
        if (ext !== '.csv') {
            console.log("I am in this function")
            res.status(200).send({ success: false, message: 'Accepts only .csv file' });
        } else if (files.file.size === 0) {
            res.status(200).send({ success: false, message: 'input file size is 0 please add the quiz data and try again.' });
        } else {
            // csv to json conversion
            try {
                const converter = csvtojsonV2();
                const jsonObj = await converter.fromFile(files.file.path);
                // var approvedQuestions = 0;
                // var rejectedQuestions = 0;
                jsonObj.forEach(async function (dataValues) {
                    try {
                        const payloadValidations = await payloadValidation.payloadValidationOfQuizData(dataValues);
                        //console.log(payloadValidations);

                        if (payloadValidations.success) {
                            await quizModel.collection.insertOne(payloadValidations.value);
                        }
                        else {
                            res.status(404).send({ message: `${payloadValidations.message}` });
                        }
                    } catch (err) {
                        logger.error({ topic: 'Something went wrong', message: `${err}` });
                        res.status(500).send({ message: `${err}` });
                    }
                });
            } catch (err) {
                res.status(200).send({ success: false, message: 'Something went wrong please try after sometime.', err });
            }
        }
        // console.log("first",err); console.log("second",fields); console.log("third",files);
    });
};

module.exports = { quizDataCreation }