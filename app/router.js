'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // 查询batch是否重复
  router.get('/input/repeatBatch', controller.analyser.repeatBatch);
  // excel导入
  router.post('/input/xlsx2db', controller.analyser.uploadXLSX);
  // 分页数据接口
  router.post('/result/pagedata', controller.analyser.selectLimit);
  // 统计接口
  router.get('/statistics/teststand', controller.statistics.teststand);
};
