'use strict';

const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));

const questionDetails = Joi.object({
    'questionPartOne': Joi.string().min(2).max(1000).trim().required(),
    'questionType': Joi.string().min(2).max(20).trim().required(),
});

const quizDetails = Joi.object({
    'name': Joi.string().min(2).max(100).trim().required(),
    'url':Joi.string().min(2).max(100).trim(),
    'questionNumber': Joi.number().integer().min(1).max(50).required(),
    'question': questionDetails,
    'options': Joi.array().items(Joi.string()).required(),
    'optionListIn' : Joi.string().min(1).max(50).trim(),
    'answer': Joi.string().min(1).max(500).trim().required(),
    'keyAnswer': Joi.string().min(1).max(10).trim().required(),
    'correctAnswerResponseWord': Joi.string().min(2).max(1000).trim().required(),
    'correctAnswerResponse': Joi.string().min(2).max(5000).trim().required(),
    'wrongAnswerResponseWord': Joi.string().min(2).max(1000).trim().required(),
    'wrongAnswerResponse': Joi.string().min(2).max(5000).trim().required(),
});

const metadataSchemaValidation = Joi.object().keys({
    name: Joi.string().min(2).trim().required(),
    type: Joi.string().min(2).trim().required(),
    url: Joi.string().min(2).trim().required(),
    lastModified: Joi.date().iso().required(),
    sizeInBytes: Joi.number().required(),
    bucket: Joi.string().required(),
    purpose: Joi.string().required(),
    keyName: Joi.string().required(),
    user: Joi.string(),
    status: Joi.string(),
    recordCount: Joi.number(),
    action: Joi.string(),
  });

  function payloadValidationOfS3Data(data) {
    const validationResult = {};
    if (!data) {
        validationResult['success'] = false;
        validationResult['message'] = 'S3 Data cannot be empty';
        return validationResult;
    } else {
        const validationStats = metadataSchemaValidation.validate(data);
        if (validationStats.error) {
            validationResult['success'] = false;
            validationResult['message'] = validationStats.error.details[0].message;
            console.log(validationResult);
            return validationResult;
        } else {
            validationResult['success'] = true;
            validationResult['message'] = 'S3 data validation is successfully done';
            validationResult['value'] = validationStats.value;
            return validationResult;
        }
    }
}

function payloadValidationOfQuizData(data) {
    const validationResult = {};
    if (!data) {
        validationResult['success'] = false;
        validationResult['message'] = 'Quiz Data cannot be empty';
        return validationResult;
    } else {
        const validationStats = quizDetails.validate(data);
        if (validationStats.error) {
            validationResult['success'] = false;
            validationResult['message'] = validationStats.error.details[0].message;
            console.log(validationResult);
            return validationResult;
        } else {
            validationResult['success'] = true;
            validationResult['message'] = 'Quiz data validation is successfully done';
            validationResult['value'] = validationStats.value;
            return validationResult;
        }
    }
}

module.exports = { payloadValidationOfQuizData, payloadValidationOfS3Data };