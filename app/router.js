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
  // 获取batch下拉列表
  router.get('/result/batchSelect', controller.analyser.batchSelect);

  // 统计接口
  router.get('/statistics/teststand', controller.statistics.teststand);
  // 分页统计接口
  router.post('/statistics/pagedata', controller.statistics.selectLimit);
  // 统计详情接口
  router.post('/statistics/searchDetail', controller.statistics.searchDetail);
  // 获取图表数据
  router.post('/statistics/getChartData', controller.statistics.getChartData);
  // cuntomer 单场比赛统计图数据
  router.post(
    '/statistics/getSingleField',
    controller.statistics.getSingleField
  );
  // 删除接口
  router.post('/result/deleteBatch', controller.analyser.deleteBatch);

  //测试上传哦
  router.post('/heiheihei/hahaha',controller.test.upload)
};
