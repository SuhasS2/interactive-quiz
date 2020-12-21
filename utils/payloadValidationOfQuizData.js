'use strict';

const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));

const questionDetails = Joi.object({
    'questionPartOne': Joi.string().min(2).max(1000).trim().required(),
    'questionType': Joi.string().min(2).max(20).trim().required(),
});

const quizDetails = Joi.object({
    'name': Joi.string().min(2).max(100).trim().required(),
    'questionNumber': Joi.number().integer().min(1).max(50).required(),
    'question': questionDetails,
    'options': Joi.array().items(Joi.string()).required(),
    'answer': Joi.string().min(1).max(500).trim().required(),
    'keyAnswer': Joi.string().min(1).max(10).trim().required(),
    'correctAnswerResponseWord': Joi.string().min(2).max(100).trim().required(),
    'correctAnswerResponse': Joi.string().min(2).max(500).trim().required(),
    'wrongAnswerResponseWord': Joi.string().min(2).max(100).trim().required(),
    'wrongAnswerResponse': Joi.string().min(2).max(500).trim().required(),
});

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

module.exports = { payloadValidationOfQuizData };