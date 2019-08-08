'use strict';

const Controller = require('egg').Controller;
// const fs = require('fs');
// const path = require('path');

class AnalyserController extends Controller {
  async uploadXLSX() {
    const { ctx } = this;
    // ctx中取得文件
    const stream = await ctx.getFileStream();
    console.log(stream);
    // const { file } = ctx.req;
    // const { batchNum } = ctx.req.body;
    // console.log(batchNum);
    // console.log(file);
    ctx.body = 1;
  }
}

module.exports = AnalyserController;
