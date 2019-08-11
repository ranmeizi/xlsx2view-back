'use strict';

const Controller = require('egg').Controller;

class AnalyserController extends Controller {
  async uploadXLSX() {
    const { ctx } = this;
    // ctx中获取流
    const stream = await ctx.getFileStream();
    // 交给service处理
    ctx.service.analyser.getWorkbook(stream);
  }
}

module.exports = AnalyserController;
