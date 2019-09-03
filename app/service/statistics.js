'use strict';
const { StatisticalTable } = require('../utils/mapping');

const Service = require('egg').Service;

class StatisticsService extends Service {
  /**
   * 根据batch生成统计数据
   * @param {*} batch 批次号
   */
  async creatBatchStatistics(batch) {
    try {
      // 查询batch表信息，获得这场对阵额外数据
      const rc = await this.app.mysql.query(`SELECT * FROM import_batch WHERE batch='${batch}'`);
      const batchData = rc.length ? rc[0] : {};
      const statConfig = { ...StatisticalTable };
      const statisticsData = {};
      // 循环StatisticalTable，使用bind到statisticsData上的方法执行,传递一个查询方法，让他依次给statisticsData赋值
      Object.values(statConfig).forEach(item => {
        await item.formula.bind(statisticsData)(batchData, sql => this.app.mysql.query(sql));
      });

    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = StatisticsService;
