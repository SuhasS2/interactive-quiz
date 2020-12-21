"use strict";
const readQuizDetails = require('./controllers/fetchQuestion');
const createQuizDetails = require('./controllers/uploadQuestion');

exports.init = (router) => {
  router.route('/').get((req, res) => {
    res.status(200).json({ success: true, message: 'Welcome' });
  });

  router.route('/get-quiz-data').get(readQuizDetails.readQuizData);
  router.route('/add-quiz-data').post(createQuizDetails.createQuizData);
};