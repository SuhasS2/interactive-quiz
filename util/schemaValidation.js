'use strict';

const Joi = require('@hapi/joi');
// Joi.objectId = require('joi-objectid')(Joi);
const logger = require('../config/winston-config');
const urlPattern = /^\/[0-9a-z\/-]+\/$/;
const instancePattern = /^[a-zA-Z-]+$/;
const namePattern = /^[a-zA-Z0-9- ]+/;

// File Upload Metadata Validation Rules
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

/**
 * @param {Array} jsonArrayValue - A JSON Object obtained from the file upload.
 * @param {String} schemaType - Type of Schema that needs to be validated against.
 * @return {Object} - Returns the JSON Object if all key-value pairs pass the schema validation, else will send an error report.
 */
async function schemaValidation(data) {
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

module.exports = { schemaValidation };
