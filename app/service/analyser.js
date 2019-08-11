'use strict';

const XLSX = require('xlsx');
const Service = require('egg').Service;

class AnalyserService extends Service {
  // 使用流获取buffer数组
  async getWorkbook(stream) {
    const buffers = [];
    stream.on('data', function(data) {
      buffers.push(data);
    });
    stream.on('end', () => {
      const buffer = Buffer.concat(buffers);
      const workbook = XLSX.read(buffer, { type: 'array' });
      this.getXLSData(workbook);
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
    console.log(result);
    return result;
  }
}

module.exports = AnalyserService;
