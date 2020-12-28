'use strict';

const formidable = require('formidable');
const logger = require('../config/logger');
const path = require('path');
const csvtojsonV2 = require('csvtojson');
const payloadValidation = require('../utils/payloadValidationOfQuizData');
const quizModel = require('../models/interactiveQuizData');
const s3Model = require('../models/fileUploadMeta');

async function quizDataCreation(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => { // to get form data 
        const ext = path.extname(files.file.name);
        console.log(ext);
        console.log(files.file.type);
        if (ext !== '.csv') {
            console.log("I am in this function")
            res.status(400).send({ success: false, message: 'Accepts only .csv file' });
        } else if (files.file.size === 0) {
            res.status(400).send({ success: false, message: 'input file size is 0 please add the quiz data and try again.' });
        } else {
            // csv to json conversion
                const dT = new Date().toString().split(' ');
                const day = `${dT[1]}-${dT[2]}-${dT[3]}`;
                const csvFilePath = `${process.env.S3_BUCKET}/${process.env.NODE_ENV}/${process.env.S3_PRIMARY}/${day}/${files.file.name}`;

                const converter = csvtojsonV2();
                const jsonObj = await converter.fromFile(files.file.path);
                console.log(jsonObj.length);
                // var approvedQuestions = 0;
                // var rejectedQuestions = 0;

                jsonObj.forEach(async function (dataValues) {
                    try {
                        const payloadValidations = await payloadValidation.payloadValidationOfQuizData(dataValues);
                        //console.log(payloadValidations);

                        if (payloadValidations.success) {
                            //statusArr.push(payloadValidations.value);
                            //await quizModel.collection.insertOne(payloadValidations.value);
                        }
                        else {
                            res.status(404).send({ message: `${payloadValidations.message}` });
                        }
                    } catch (err) {
                        logger.error({ topic: 'Something went wrong', message: `${err}` });
                        res.status(500).send({ message: `${err}` });
                    }
                }); res.status(200).send({ message: "Quiz Details Uploaded Successfully" });
                await s3Params(csvFilePath,files.file.type,files.file.size,files.file.name,jsonObj.length,res);
                //await quizModel.collection.insertMany(statusArr); 
            }
    });
};

async function s3Params(pathField,typeFile,fileSize,fileName,objectLength,res) {
    const s3MetaData = {}
    s3MetaData.name = pathField;
    s3MetaData.type = typeFile;
    s3MetaData.url = "ABCD";
    s3MetaData.lastModified = new Date();
    s3MetaData.sizeInBytes = fileSize;
    s3MetaData.bucket = process.env.S3_BUCKET;
    s3MetaData.purpose = "Quiz Data Uploading";
    s3MetaData.keyName = fileName;
    s3MetaData.user = "XYZ";
    s3MetaData.status = "Records updated successfully to the database";
    s3MetaData.recordCount =objectLength;
    s3MetaData.action = "Upload";
    try{
    const s3Validation = await payloadValidation.payloadValidationOfS3Data(s3MetaData);
    if (s3Validation.success) {
        await s3Model.collection.insertOne(s3Validation.value);
        res.status(200).send({ message: 'S3 Details are inserted successfully' });
    } else {
        res.status(400).send({ message: 'Something went wrong' });
    }}catch (err) {
        logger.error({ topic: 'Something went wrong', message: `${err}` });
        res.status(500).send({ message: `${err}` });
}}

module.exports = { quizDataCreation }

