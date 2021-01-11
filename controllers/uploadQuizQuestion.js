'use strict';

const express = require('express');
const logger = require('../config/winston-config');
const csvtojson = require('csvtojson');
const s3Util = require('../util/s3Modules');
const quizData = require('../model/interactiveQuizData');
const dataValidation = require('../util/payloadValidationOfQuizData');
const url = require('url');

/**
 * @param {Object} req
 * @param {Object} res
 * Validating and uploading quizData to the database
*/
async function quizDataCreation(req, res) {
  //   if (!req.body || (Object.keys(req.body).length !== 1 && req.body.constructor === Object)) {
  //       console.log(req);
  //     res.status(400).send({message: 'Invalid Payload'});
  //   } else {
  try {
    //console.log(req)
    const formfields = await s3Util.fileParsing(req);

    console.log(Object.keys(formfields.fields));
    //console.log(typeof formfields.files.file1)
    if (Object.keys(formfields.files).length !== 1 || !formfields.files.file || Object.keys(formfields.fields).length >= 1) {
      //console.log(Object.keys((formfields.files).length+' : '+formfields.files.file) 
      res.status(400).send({ message: 'Invalid Payload' });
    } else {
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
          try {
            const dT = new Date().toString().split(' ');
            const day = `${dT[1]}-${dT[2]}-${dT[3]}`;
            const csvFilePath = `${process.env.S3_BUCKET}/${process.env.NODE_ENV}/${process.env.S3_CATEGORY}/${day}`;
            const csvFileDetails = await s3Util.createFileObject(formfields.files.file.type, objPurpose, formfields.files.file.name, formfields.fields.user, process.env.S3_BUCKET, csvFilePath);
            //const validateMetadata = await s3Util.s3UploadFile(readFileData, csvFileDetails);
            // if (validateMetadata.Count === 1) {
            const a = 1;
            if (a === 1) {
              try {
                const jsonObj = await csvtojson().fromFile(formfields.files.file.path);
                const checkUrl = url.parse(jsonObj[0].url);
                const docCount = await quizData.collection.countDocuments({url: checkUrl.pathname, active: true});
                const passCount = await validationOfQuizRecords(jsonObj);
                if (passCount === jsonObj.length) {
                  if (jsonObj.length === docCount) {
                    await quizData.collection.updateMany({url: checkUrl.pathname}, {$set: {active: false}});
                  }
                  for (const i in jsonObj) {
                    jsonObj[i].active = true;
                    const uploadData = jsonObj[i];
                    await quizData.collection.insertOne(uploadData);
                  }
                  res.status(200).send({message: 'Quiz Data Uploaded Successfully'});
                } else {
                  logger.error({message: 'Quiz data upload failed, something went wrong'});
                  res.status(400).send({message: `${passCount} questions are validated successfully and ${jsonObj.length - passCount} questions are failed during validation`});
                }
              } catch (err) {
                logger.error({ topic: 'Something went wrong', message: `${err}` });
                res.status(500).send({ message: `${err}` });
              }
            }
          } catch (err) {
            logger.error({ topic: 'Something went wrong', message: `${err}` });
            res.status(500).send({ message: `${err}` });
          }
        }
      }
    }
  } catch (err) {
    logger.error({ topic: 'Something went wrong', message: `${err}` });
    res.status(500).send({ message: `${err}` });
  }
}
//}

/**
 * @param {Object} jsonObj
 * Validating and uploading quizData to the database
*/
async function validationOfQuizRecords(jsonObj) {
  try {
    let validationPassCount = 0;
    for (const dataValues in jsonObj) {
      const newUrl = url.parse(`${jsonObj[dataValues].url}`);
      const newUrlPath = newUrl.pathname;
      const quizDetails = jsonObj[dataValues];
      quizDetails.name = jsonObj[dataValues].name;
      quizDetails.questionNumber = parseInt(jsonObj[dataValues].questionNumber);
      quizDetails.question['questionPartOne'] = jsonObj[dataValues].question.questionPartOne;
      quizDetails.question['questionType'] = jsonObj[dataValues].question.questionType;
      quizDetails.options = jsonObj[dataValues].options.filter((item) => item);
      quizDetails.optionListIn = jsonObj[dataValues].optionListIn;
      quizDetails.keyAnswer = jsonObj[dataValues].keyAnswer;
      quizDetails.answer = jsonObj[dataValues].answer;
      quizDetails.correctAnswerResponseWord = jsonObj[dataValues].correctAnswerResponseWord;
      quizDetails.correctAnswerResponse = jsonObj[dataValues].correctAnswerResponse;
      quizDetails.wrongAnswerResponse = jsonObj[dataValues].wrongAnswerResponse;
      quizDetails.wrongAnswerResponseWord = jsonObj[dataValues].wrongAnswerResponseWord;
      quizDetails.url = newUrlPath;
      const payloadValidation = await dataValidation.payloadValidationOfQuizData(quizDetails);
      if (payloadValidation.success) {
        validationPassCount++;
      }
    }
    return validationPassCount;
  } catch (err) {
    logger.error({ topic: 'Something went wrong', message: `${err}` });
    res.status(500).send({ message: `${err}` });
  }
}

module.exports = { quizDataCreation };
