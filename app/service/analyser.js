'use strict';

const XLSX = require('xlsx');
const Service = require('egg').Service;
const { columnMapper, reverseCol } = require('../utils/mapping');
const moment = require('moment');

class AnalyserService extends Service {
  // 使用流获取buffer数组
  async getWorkbook(stream) {
    return new Promise((resolve, reject) => {
      const buffers = [];
      stream.on('data', function (data) {
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
    workbook.SheetNames.forEach(function (sheetName) {
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
    let dateColIndexs = []
    const columnsArr = Object.values(columns);
    columnsArr.forEach((item, index) => {
      if (item === 'order_date') {
        dateColIndexs.push(index)
      }
    })

    const dataTable = [];
    data.forEach(row => {
      const obj = {};
      row.forEach((value, colIndex) => {
        obj[columnsArr[colIndex]] = dateColIndexs.indexOf(colIndex) >= 0 ? moment(dateParser(value)).format('YYYYMMDDHHmmss') : value;
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
        (reverseCol[keys[index]].type === 'varchar' ? `'${Transferred(val)}'` : Transferred(val))
      );

      const c = keys.join(',');
      const v = values.join(',');

      sqlList.push(`INSERT INTO ticket_xls (${c},batch) VALUES (${v},'${batchNum}')`);
    });
    return sqlList;
  }
}

module.exports = AnalyserService;

function Transferred(val) {
  val += '';
  return val.replace(/'/, '\\\'');
}
function dateParser(date) {
  let day = Math.floor(date)
  let hour = Math.floor((date - day) * 24)
  let min = Math.floor(((date - day) * 24 - hour) * 60)
  let sec = Math.round((((date - day) * 24 - hour) * 60 - min) * 60)
  return new Date(1900, 0, day - 1, hour, min, sec)
}
