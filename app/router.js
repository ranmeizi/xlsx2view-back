'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/input/xlsx2db', controller.analyser.uploadXLSX);
  router.post('/result/pagedata', controller.analyser.selectLimit);
};
