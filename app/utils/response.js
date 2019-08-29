'use strict';
module.exports = class {
  constructor({ data, info, msg }) {
    this.data = data; // 返回数据
    this.info = info; // 错误信息
    this.msg = msg; // 提示消息
    this.success = info.length === 0;
  }
}
;
