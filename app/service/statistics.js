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
      const rc = await this.app.mysql.query(
        `SELECT * FROM import_batch WHERE batch='${batch}'`
      );
      const batchData = rc.length ? rc[0] : {};
      const formulaList = Object.values({ ...StatisticalTable });
      const statisticsData = {};
      // 循环StatisticalTable，使用bind到statisticsData上的方法执行,传递一个查询方法，让他依次给statisticsData赋值
      //-------错误的循环--------foreach不阻塞
      // Object.values(statConfig).forEach(async item => {
      //   if (item.round === 0) {
      //     await item.formula.bind(statisticsData)(batchData, async sql =>
      //       await this.app.mysql.query(sql)
      //     );
      //   }
      // });
      // Object.values(statConfig).forEach(async item => {
      //   if (item.round === 1) {
      //     await item.formula.bind(statisticsData)(batchData, async sql =>
      //       await this.app.mysql.query(sql)
      //     );
      //   }
      // });
      //-------正确的循环--------递归函数阻塞
      const formulaList_round0 = formulaList.filter(item => item.round === 0)
      const formulaList_round1 = formulaList.filter(item => item.round === 1)
      let that = this
      await (async function forEach(index) {
        if (index === formulaList_round0.length - 1) {
          return
        }
        await formulaList_round0[index].formula.bind(statisticsData)(batchData, async sql =>
          await that.app.mysql.query(sql)
        );
        await forEach(index + 1)
      })(0)
      await (async function forEach(index) {
        if (index === formulaList_round1.length - 1) {
          return
        }
        await formulaList_round1[index].formula.bind(statisticsData)(batchData, async sql =>
          await that.app.mysql.query(sql)
        );
        await forEach(index + 1)
      })(0)
      console.log(statisticsData);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = StatisticsService;
