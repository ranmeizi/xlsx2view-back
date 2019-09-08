'use strict';

const Controller = require('egg').Controller;
const { StatisticalTable } = require('../utils/mapping');

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
      const { ctx } = this;
      const { current } = ctx.request.body;
      const select = `select * from rpt_table limit ${(current - 1) * 12},12`;
      const selectCount = 'select count(*)as cnt from rpt_table';

      const list = await this.app.mysql.query(select);
      const count = await this.app.mysql.query(selectCount);
      this.ctx.body = {
        success: true,
        data: {
          list,
          count: count[0].cnt,
        },
      };
    } catch (e) {
      console.log(e);
    }
  }
  async searchDetail() {
    console.log('进来了');
    const { ctx } = this;
    try {
      const { batch } = ctx.request.body;
      const sql = `select * from rpt_table where batch='${batch}'`;
      const result = await this.app.mysql.query(sql);
      console.log(result);
      ctx.body = await ctx.service.response.index({ data: result[0], err: '' });
    } catch (e) {
      console.log(e);
      ctx.body = await ctx.service.response.index({ data: null, err: e });
    }
  }
  async getChartData() {
    const { ctx } = this;
    try {
      const { batchs } = ctx.request.body;
      const sql = `select * from rpt_table where batch in ('${batchs.join("','")}')`;
      const result = await this.app.mysql.query(sql);
      // 统计维度
      const oppositions = [];
      result.forEach(item => {
        oppositions.push(item.opposition);
      });

      ctx.body = await ctx.service.response.index({
        data: { result, oppositions },
        err: '',
      });
    } catch (e) {
      console.log(e);
      ctx.body = await ctx.service.response.index({ data: null, err: e });
    }
  }
  // 查询单场比赛数据分析
  async getSingleField() {
    const { ctx } = this
    try{
      const {batch,statTable}=ctx.request.body
      let result={}
      // 根据statTable调用service
      switch(statTable){
        case 'SELL_TICKET' : result=await ctx.service.statistics.search_SELL_TICKET
      }
    }catch(e){
      ctx.body = await ctx.service.response.index({ data: null, err: e });
    }
  }
}

module.exports = StatisticsController;
