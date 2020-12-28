'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');
const formidable = require('formidable');
const s3 = require('../config/s3-config');
const logger = require('../config/winston-config');
const upload = require('../models/fileUploadMeta');
const schema = require('../utils/payloadValidationOfQuizData');

const form = new formidable.IncomingForm();
const csv = 'csv';

/**
 *
 * @param {Object} file File that was uploaded.
 * @return {Boolean} Returns a boolean value.
 */
async function checkFileType(file) {
  logger.info({'File Type': file.file.type, 'Function': 'checkFileType'});
  const ext = path.extname(file.file.name);
  if (file.file.type === 'text/csv' || file.file.type === 'application/vnd.ms-excel' || ext === `.${csv}`) {
    return true;
  } else {
    return false;
  }
}

/**
 *
 * @param {Object} fileBody File that was uploaded.
 * @return {Object} Returns the details of the files uploaded.
 */
async function fileParsing(fileBody) {
  const parsedFields = await new Promise(function(resolve, reject) {
    form.parse(fileBody, function(err, fields, files) {
      if (err) {
        reject(err);
        return;
      } else {
        const fileDetails = {};
        fileDetails['files'] = files;
        fileDetails['fields'] = fields;
        resolve(fileDetails);
      }
    });
  });
  return parsedFields;
}

/**
 *
 * @param {String} type
 * @param {String} purpose
 * @param {String} keyName
 * @param {String} user
 * @param {String} bucket
 * @param {String} bucketPath
 * @return {Object} Returns the object created for the received file.
 */
async function createFileObject(type, keyName, user, bucket, bucketPath) {
  const fileDetailObj = {
    type: type,
    keyName: keyName,
    user : user,
    bucket: bucket,
    bucketPath: bucketPath,
  };
  return fileDetailObj;
}

/**
 *
 * @param {String} filePath Temporary file path to read the data.
 * @return {String/Boolean} On success will return the data else will return a boolean value.
 */
async function s3ReadFile(filePath) {
  const readFile = util.promisify(fs.readFile);
  try {
    const bufferData = await readFile(filePath);
    const fileData = Buffer.from(bufferData).toString();
    return fileData;
  } catch (err) {
    logger.error({errorMessage: err});
    return false;
  }
}

/**
 *
 * @param {String} fileData
 * @param {Object} fileObject
 * @return {Object}
 */
async function generateCsvParam(fileData, fileObject) {
  const generateParam = {
    Bucket: fileObject.bucketPath,
    Key: `${fileObject.keyName}`,
    Body: fileData,
  };
  return generateParam;
}

/**
 *
 * @param {String} fileData
 * @param {Object} fileObject
 */
async function s3UploadFile(fileData, fileObject) {
  
  const generatedParam = await generateCsvParam(fileData, fileObject);
  console.log(generatedParam);
  const getUploadResult = await s3.upload(generatedParam).promise();
  console.log(getUploadResult);
  try {
    if (getUploadResult.Location || getUploadResult.Key) {
      fileObject['url'] = getUploadResult.Location;
      fileObject['name'] = getUploadResult.Key;
      delete fileObject['bucketPath'];

      return await getFileUploadDetails(fileObject);
    } else {
      logger.error({message: 'Unable to upload the provided file'});
      const errMsg = {
        success: false,
        message: 'Unable to upload the provided file',
      };
      return errMsg;
    }
  } catch (err) {
    logger.error({success: false, error: err});
  }
}

/**
 *
 * @param {Object} fileObject
 */
async function getFileUploadDetails(fileObject) {
  const listParams = {
    Bucket: process.env.S3_BUCKET,
    Prefix: fileObject.name,
  };
console.log(listParams);
  try {
    const getObjectVersions = await s3.listObjectVersions(listParams).promise();
    console.log(getObjectVersions);
    if (getObjectVersions.Versions) {
      fileObject['lastModified'] = getObjectVersions.Versions[0].LastModified;
      fileObject['sizeInBytes'] = getObjectVersions.Versions[0].Size;
      fileObject['status'] = 'Initiated';
      console.log(fileObject);
      return await metadata(fileObject);
    } else {
      logger.error({message: 'Unable to get details of the last uploaded file.'});
      const errMsg = {
        success: false,
        message: 'Unable to get the details of the last upload',
      };
      return errMsg;
    }
  } catch (err) {
    logger.error({success: false, error: err});
  }
}

/**
 *
 * @param {Object} fileObject
 */
async function metadata(fileObject) {
  try {
    const fileSchemaValidation = await schema.schemaValidation(fileObject, schema.metadataSchemaValidation);
    if (fileSchemaValidation.details) {
      logger.error({message: 'Unable to get the details required for metadata', messageInfo: fileSchemaValidation.details[0]});
      const errMsg = {
        success: false,
        message: `Unable to get the details required for metadata ${fileSchemaValidation.details[0].message}`,
        keyMissing: fileSchemaValidation.details[0].context,
        record: fileSchemaValidation._object,
      };
      return errMsg;
    } else {
      const metadataUpdateStatus = await upload.collection.insertOne({'name': fileSchemaValidation[0].name, 'url': fileSchemaValidation[0].url, 'type': fileSchemaValidation[0].type, 'bucket': fileSchemaValidation[0].bucket, 'lastModified': fileSchemaValidation[0].lastModified, 'sizeInBytes': fileSchemaValidation[0].sizeInBytes, 'purpose': fileSchemaValidation[0].purpose, 'keyName': fileSchemaValidation[0].keyName, 'user': fileSchemaValidation[0].user, 'status': fileSchemaValidation[0].status});
      const metaFinalDetails = {
        'Count': metadataUpdateStatus.insertedCount,
        'ID': metadataUpdateStatus.insertedId,
        'Name': metadataUpdateStatus.ops[0].name,
      };
      return metaFinalDetails;
    }
  } catch (err) {
    logger.error({success: false, error: err});
  }
}

module.exports = {checkFileType, fileParsing, s3ReadFile, generateCsvParam, s3UploadFile, createFileObject, getFileUploadDetails};
