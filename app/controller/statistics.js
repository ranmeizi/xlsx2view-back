'use strict';

const Controller = require('egg').Controller;

class StatisticsController extends Controller {
  async teststand() {
    const sql =
      'SELECT location_1,price_tier,COUNT(*) AS CNT FROM ticket_xls GROUP BY location_1,price_tier';
    const data = await this.app.mysql.query(sql);
    let legend = {};
    let yAxis = {};
    const yArr = {};
    data.forEach(item => {
      legend[item.location_1] = 1;
      yAxis[item.price_tier] = 1;
    });
    legend = Object.keys(legend);
    yAxis = Object.keys(yAxis);

    yAxis.forEach(key => {
      const arr = [];
      yAxis.forEach((a, index) => {
        arr[index] = 0;
      });
      data.forEach(row => {
        if (row.price_tier === key) {
          arr[legend.indexOf(row.location_1)] = row.CNT;
        }
      });
      yArr[key] = arr;
    });
    console.log(yArr);
    this.ctx.body = {
      legend,
      yAxis,
      yArr,
    };
  }
  // 分页查询
  async selectLimit() {
    try {
      const { current } = this.ctx.request.body;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = StatisticsController;
