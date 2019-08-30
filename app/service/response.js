'use strict';

const Service = require('egg').Service;

class ResponseService extends Service {
  async index({ err, data }) {
    console.log(err, data);
    let success = true;
    let msg;
    // 有没有报错
    if (err.length > 0) {
      msg = err;
      success = false;
    } else {
      msg = '成功';
      // 有没有数据
      if (!data) {
        msg = '没有数据';
      }
    }
    return { success, msg, data };
  }
}

module.exports = ResponseService;
