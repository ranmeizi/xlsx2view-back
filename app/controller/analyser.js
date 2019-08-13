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
      const sqlList = await ctx.service.analyser.getSql(dataTable, stream.fields.batchNum);

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
      // 取数据
      console.log(this.ctx.request.body)
      let { pageSize, startTime, endTime, pageNum, batchNum } = this.ctx.request.body
      let select = `SELECT * FROM ticket_xls WHERE order_date BETWEEN '${startTime}' and '${endTime}'`
      let batch = batchNum ? ` and batch='${batch}'` : ''
      let limit = ` limit ${(pageNum - 1) * pageSize},${pageSize}`
      let sql = select + batch + limit
      console.log(await this.app.mysql.query(sql));
    } catch (e) {

    }
  }
}

module.exports = AnalyserController;
