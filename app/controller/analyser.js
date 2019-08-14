'use strict';

const Controller = require('egg').Controller;

class AnalyserController extends Controller {
  // 上传excel
  async uploadXLSX() {
    try {
      const { ctx } = this;
      // ctx中获取流
      const stream = await ctx.getFileStream();
      // getWorkbook 将流转为json数据
      const workbook = await ctx.service.analyser.getWorkbook(stream);

      // getXLSData 格式化数据，把初始数据用xlsx转换为方便使用的json数据
      const sheet1 = await ctx.service.analyser.getXLSData(workbook);

      // dataParser  格式化数据，，把他分为表头与数据
      const dataTable = await ctx.service.analyser.dataParser(sheet1);

      // getSqlList
      const sqlList = await ctx.service.analyser.getSql(
        dataTable,
        stream.fields.batchNum
      );

      // 执行SQL语句
      sqlList.forEach(sql => {
        this.app.mysql.query(sql);
      });

      this.ctx.body = this.ctx.service.response.index({ data: null, err: '' });
    } catch (err) {
      console.log(err);
      this.ctx.body = this.ctx.service.response.index({ data: null, err });
    }
  }
  // 分页查询
  async selectLimit() {
    try {
      // 根据筛选条件查询数据库
      let { list, count } = await this.ctx.service.analyser.pageSelect();
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
}

module.exports = AnalyserController;
