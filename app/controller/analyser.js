'use strict';

const Controller = require('egg').Controller;
const Response = require('../utils/response');

class AnalyserController extends Controller {
  // 检查批次号是否重复
  async repeatBatch() {
    try {
      const { ctx } = this;
      // 取值
      const { batch } = ctx;
      const sql = `select * from import_batch where batch='${batch}'`;
      const rc = await this.app.mysql.query(sql);

      let repeat = false;
      let msg = '成功';
      const info = '';
      if (rc.length > 0) {
        // 有数据
        repeat = true;
        msg = 'Repeated batch number!!';
      } else {
        // 没数据
        repeat = false;
        msg = 'Batch number available';
      }
      this.ctx.body = new Response({
        data: { repeat },
        msg,
        info,
      });
    } catch (e) {
      console.log(e);
    }
  }

  // 上传excel ----重写
  async uploadXLSX() {
    try {
      const { ctx } = this;
      // ctx中获取流
      const stream = await ctx.getFileStream({
        limits: { fields: 20, fieldSize: 5000000 },
      });

      // 添加bacth表数据
      ctx.service.analyser.addBatch(stream.fields);

      // getWorkbook 将流转为json数据
      const workbook = await ctx.service.analyser.getWorkbook(stream);

      // getXLSData 格式化数据，把初始数据用xlsx转换为方便使用的json数据
      const sheet1 = await ctx.service.analyser.getXLSData(workbook);

      // dataParser  格式化数据，，把他分为表头与数据
      const dataTable = await ctx.service.analyser.dataParser(sheet1);

      // getSqlList
      const sqlList = await ctx.service.analyser.getSql(
        dataTable,
        stream.fields.batch
      );

      // 执行SQL语句
      sqlList.forEach(sql => {
        this.app.mysql.query(sql);
      });
      const statisticsData = await ctx.service.statistics.creatBatchStatistics(
        stream.fields.batch
      );

      // console.log(statisticsData);
      // 存到statistic表
      await ctx.service.statistics.insertStatistics(statisticsData);

      this.ctx.body = await this.ctx.service.response.index({
        data: null,
        err: '',
      });
    } catch (err) {
      this.ctx.body = await this.ctx.service.response.index({
        data: null,
        err,
      });
    }
  }
  // 分页查询
  async selectLimit() {
    try {
      // 根据筛选条件查询数据库
      let { list, count } = await this.ctx.service.analyser.pageSelect();
      console.log(list, count);
      count = count[0].CNT;
      // 表头
      const column = await this.ctx.service.analyser.getColumn(list);
      // batchs
      let batchs = await this.ctx.service.analyser.getBatchs();
      batchs = batchs.map(item => item.batch);
      this.ctx.body = {
        success: true,
        data: {
          column,
          list,
          count,
          batchs,
        },
      };
    } catch (e) {
      console.log(e);
    }
  }
  // 查询batch下拉列表
  async batchSelect() {
    const { ctx } = this;
    try {
      const sql =
        'select DISTINCT(opposition),batch,game_date from import_batch';
      const batchs = await this.app.mysql.query(sql);
      ctx.body = await ctx.service.response.index({ data: batchs, err: '' });
    } catch (e) {
      ctx.body = await ctx.service.response.index({ data: null, err: e });
    }
  }
  // 删除3个表中的batch数据
  async deleteBatch() {
    const { ctx } = this;
    const { batchs } = ctx.request.body;
    const sql = [];
    if (batchs.length > 0) {
      sql.push(`delete FROM import_batch where batch IN ('${batchs.join("','")}')`);
      sql.push(`delete FROM rpt_table where batch IN ('${batchs.join("','")}')`);
      sql.push(`delete FROM ticket_xls where batch IN ('${batchs.join("','")}')`);
    }
    const that = this;
    await (async function dosql(index) {
      if (index === sql.length) {
        return;
      }
      await that.app.mysql.query(sql[index]);
      await dosql(index + 1);
    })(0);
    ctx.body = await ctx.service.response.index({ data: true, err: '' });
  }
}

module.exports = AnalyserController;
