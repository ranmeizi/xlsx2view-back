'use strict';

const XLSX = require('xlsx');
const Service = require('egg').Service;
const { columnMapper, reverseCol, COL_import_batch } = require('../utils/mapping');
const moment = require('moment');

class AnalyserService extends Service {
  // 添加batch表数据
  async addBatch(fields) {
    const c = [];
    const v = [];
    Object.entries(fields).forEach(([ key, value ]) => {
      c.push(key);
      value = COL_import_batch[key].type === 'varchar' ? `'${value}'` : value;
      v.push(value);
    });
    const sql = `INSERT INTO import_batch (${c.join(',')},import_time) VALUES (${v.join(',')},'${moment().format('YYYY-MM-DD HH:mm:ss')}')`;
    await this.app.mysql.query(sql);
  }
  // 使用流获取buffer数组
  async getWorkbook(stream) {
    return new Promise((resolve, reject) => {
      const buffers = [];
      stream.on('data', function(data) {
        buffers.push(data);
      });
      stream.on('end', () => {
        const buffer = Buffer.concat(buffers);
        const workbook = XLSX.read(buffer, { type: 'array' });
        resolve(workbook);
      });
    });
  }
  // 使用buffer数组
  async getXLSData(workbook) {
    const result = {};
    workbook.SheetNames.forEach(function(sheetName) {
      const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
      if (roa.length) result[sheetName] = roa;
    });
    return result.Sheet1;
  }
  //
  async dataParser(dataArr) {
    // 第一行是表头
    if (dataArr.length < 1) {
      // 错误，没有表头数据
    }
    const columns = dataArr[0].map(item => columnMapper[item].col);
    // console.log(columns);

    const data = dataArr.filter((item, index) => index > 0);
    // 看看有没有要格式化时间的列
    const dateColIndexs = [];
    const columnsArr = Object.values(columns);
    columnsArr.forEach((item, index) => {
      if (item === 'order_date') {
        dateColIndexs.push(index);
      }
    });

    const dataTable = [];
    data.forEach(row => {
      const obj = {};
      row.forEach((value, colIndex) => {
        obj[columnsArr[colIndex]] =
          dateColIndexs.indexOf(colIndex) >= 0
            ? moment(dateParser(value)).format('YYYY-MM-DD HH:mm:ss')
            : value;
      });
      dataTable.push(obj);
    });
    return dataTable.filter(item => Object.keys(item).length > 0);
  }

  async getSql(xlsData, batchNum) {
    // 拼接sql语句
    const sqlList = [];
    xlsData.forEach(item => {
      const keys = Object.keys(item);
      const values = Object.values(item).map((val, index) =>
        (reverseCol[keys[index]].type === 'varchar'
          ? `'${Transferred(val)}'`
          : Transferred(val))
      );

      const c = keys.join(',');
      const v = values.join(',');

      sqlList.push(
        `INSERT INTO ticket_xls (${c},batch) VALUES (${v},'${batchNum}')`
      );
    });
    return sqlList;
  }
  /** 查询分页数据
   *
   * return array 查询结果
   */
  async pageSelect() {
    console.log(this.ctx.request.body);
    const {
      pageSize,
      startTime,
      endTime,
      pageNum,
      batchs,
    } = this.ctx.request.body;
    const select = `SELECT * FROM ticket_xls WHERE order_date BETWEEN '${startTime}' and '${endTime}'`;
    const selectCount = `SELECT count(*) AS CNT FROM ticket_xls WHERE order_date BETWEEN '${startTime}' and '${endTime}'`;
    const batch =
      batchs.length > 0 ? ` and batch IN ('${batchs.join("','")}')` : '';
    const limit = ` limit ${(pageNum - 1) * pageSize},${pageSize}`;
    const sql = select + batch + limit;
    console.log(sql);
    const rt = {
      list: await this.app.mysql.query(sql),
      count: await this.app.mysql.query(selectCount + batch),
    };
    return rt;
  }
  async getColumn(data) {
    const column = [];
    if (data.length > 0) {
      // 循环第一列获取表头
      Object.keys(data[0]).forEach(key => {
        if (key in reverseCol) {
          column.push({
            title: reverseCol[key].key,
            dataIndex: key,
            width: 'min-content',
          });
        }
      });
    }
    return column;
  }
  async getBatchs() {
    return await this.app.mysql.query('SELECT batch FROM ticket_xls GROUP BY batch');
  }
}

module.exports = AnalyserService;

function Transferred(val) {
  val += '';
  return val.replace(/'/, "\\'");
}
function dateParser(date) {
  const day = Math.floor(date);
  const hour = Math.floor((date - day) * 24);
  const min = Math.floor(((date - day) * 24 - hour) * 60);
  const sec = Math.round((((date - day) * 24 - hour) * 60 - min) * 60);
  return new Date(1900, 0, day - 1, hour, min, sec);
}
