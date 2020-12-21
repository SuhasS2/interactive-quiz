'use strict';

const winston = require('winston');
const appRoot = require('app-root-path');

const logger = winston.createLogger({
  transports: new winston.transports.File({filename: `${appRoot}/logs/app.log`}),
  exitOnError: true, // do not exit on handled exceptions
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;
