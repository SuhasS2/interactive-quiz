'use strict'

const logger = require('../config/winston-config');
const csvtojson = require('csvtojson');
const s3Util = require('../util/s3Modules');
const quizData = require('../model/interactiveQuizData');
const dataValidation = require('../util/payloadValidationOfQuizData');


async function quizDataCreation(req, res) {
    const formfields = await s3Util.fileParsing(req);
    const getFileTypeStatus = await s3Util.checkFileType(formfields.files);
    const objPurpose = process.env.S3_PURPOSE;

    if (!getFileTypeStatus) {
        logger.error({ message: 'File type not supported' });
        res.status(400).send({ message: 'File type not supported' });
    } else if (formfields.files.file.size === 0) {
        res.status(400).send({ message: 'csv file size is 0 please add some data and try after some time' });
    } else if (formfields.files.file.size > process.env.QUIZ_FILE_SIZE) {
        res.status(400).send({ message: `csv file size is too large please reduce the size to ${process.env.QUIZ_FILE_SIZE} bytes` });
    } else {
        const readFileData = await s3Util.s3ReadFile(formfields.files.file.path);
        if (!readFileData) {
            res.status(400).send({ message: 'Unable to read the data from the file uploaded' });
        } else {
            const dT = new Date().toString().split(' ');
            const day = `${dT[1]}-${dT[2]}-${dT[3]}`;
            const csvFilePath = `${process.env.S3_BUCKET}/${process.env.NODE_ENV}/${process.env.S3_PRIMARY}/${day}`;
            const csvFileDetails = await s3Util.createFileObject(formfields.files.file.type, objPurpose, formfields.files.file.name, formfields.fields.user, process.env.S3_BUCKET, csvFilePath);
            const validateMetadata = await s3Util.s3UploadFile(readFileData, csvFileDetails);
            if (validateMetadata.Count === 1) {
                try {
                    const jsonObj = await csvtojson().fromFile(formfields.files.file.path);
                    jsonObj.forEach(async function (dataValues) {
                        try {
                            const payloadValidation = await dataValidation.payloadValidationOfQuizData(dataValues);
                            if (payloadValidation.success) {
                                await quizData.collection.insertOne(payloadValidation.value);
                            } else {
                                res.status(404).send({ message: `${payloadValidation.message}` });
                            }
                        } catch (err) {
                            logger.error({ topic: 'Something went wrong', message: `${err}` });
                            res.status(500).send({ message: `${err}` });
                        }
                    });
                } catch (err) {
                    logger.error({ message: 'S3 upload failed' });
                    res.status(500).send({ message: 'S3 Upload failed' });
                }
            }
            res.status(200).send({ message: 'Quiz Data and S3 File Data Uploaded Successfully' });
        }
    }
}

module.exports = { quizDataCreation }