'use strict';
import moment from 'moment'
const columnMapper = {
  'Order no.': {
    col: 'order_no',
    type: 'varchar',
  },
  'Order Date': {
    col: 'order_date',
    type: 'varchar',
  },
  'First Name': {
    col: 'first_name',
    type: 'varchar',
  },
  Surname: {
    col: 'surname',
    type: 'varchar',
  },
  Email: {
    col: 'email',
    type: 'varchar',
  },
  Quantity: {
    col: 'quantity',
    type: 'smallint',
  },
  'Price Tier': {
    col: 'price_tier',
    type: 'varchar',
  },
  'Ticket Type': {
    col: 'ticket_type',
    type: 'varchar',
  },
  Discount: {
    col: 'discount',
    type: 'varchar',
  },
  'Location 1': {
    col: 'location_1',
    type: 'varchar',
  },
  'Location 2': {
    col: 'location_2',
    type: 'varchar',
  },
  'Location 3': {
    col: 'location_3',
    type: 'varchar',
  },
  'Order Type': {
    col: 'order_type',
    type: 'varchar',
  },
  'Total Paid': {
    col: 'total_paid',
    type: 'double',
  },
  'Fees Paid': {
    col: 'fees_paid',
    type: 'double',
  },
  'Eventbrite Fees': {
    col: 'eventbrite_fees',
    type: 'double',
  },
  'Attendee Status': {
    col: 'attendee_status',
    type: 'varchar',
  },
  'Are you willing to receive promotional offers from the club?': {
    col: 'promotional_willing',
    type: 'varchar',
  },
};

const COL_import_batch = {
  batch: {
    type: 'varchar',
  },
  game_date: {
    type: 'varchar',
  },
  opposition: {
    type: 'varchar',
  },
  weekday: {
    type: 'varchar',
  },
  days_since_prev_game: {
    type: 'int',
  },
  no_of_groups: {
    type: 'int',
  },
  group_adults: {
    type: 'int',
  },
  group_children: {
    type: 'int',
  },
  group_tickets_revenue: {
    type: 'double',
  },
  eventbrite_add_ons: {
    type: 'double',
  },
  group_add_ons_food: {
    type: 'double',
  },
  other_add_ons_food: {
    type: 'double',
  },
  spare_comps_printed: {
    type: 'int',
  },
  comparable_game_date: {
    type: 'varchar',
  },
  import_time: {
    type: 'varchar',
  },
};

// 倒排value-key
const reverseCol = {};
const $keys = Object.keys(columnMapper);
const $values = Object.values(columnMapper);
for (let i = 0; i < $keys.length; i++) {
  reverseCol[$values[i].col] = {
    key: $keys[i],
    type: $values[i].type,
  };
}
/*
round:循环轮次
0-第一次计算直接返回的值和常量和sql查询这类一次完成的值
1-第二次计算比值这类依赖别的值的公式
*/ 
const StatisticalTable = {
  // 系统用批次号
  batch: {
    type: 'varchar',
    round:0,
    formula: async (batchData, $QueryFn) => {
      this.batch = batchData.batch;
    },
  },
  // 对阵名称
  opposition: {
    type: 'varchar',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.opposition = batchData.opposition;
    },
  },
  // 星期
  weekday: {
    type: 'varchar',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.weekday = batchData.weekday;
    },
  },
  // 上次比赛间隔
  days_since_prev_game: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.days_since_prev_game = batchData.days_since_prev_game;
    },
  },
  // ebrite售票总数
  total_tickets_ebrite: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select count(*) as cnt from ticket_xls where ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt;
      this.total_tickets_ebrite=result
  },
  // 检票总数
  tickets_scanned: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select count(*) as cnt from ticket_xls where attendee_status='Checked In' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt;
      this.tickets_scanned=result
    },
  },
  // 检票率
  per_scanned: {
    type: 'varchar',
    round:1,
    formula: async (batchData, $QueryFn) => {
      this.per_scanned=(this.tickets_scanned/this.total_tickets_ebrite).toFixed(2)
    },
  },
  // 容量，这是个常量
  capacity: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 这是个常量
      return 2185;
    },
  },
  // 季票？？？
  season_tics_comps: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      //
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select count(*) as cnt from ticket_xls where total_paid!='0'  and ticket_type not like '%Bundle%' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt;
      this.season_tics_comps=result
    },
  },
  // ???total_tickets_ebrite-season_tics_comps  不知道啥意义但是原来就是这个公式
  tickers_sold: {
    type: 'int',
    round:1,
    formula: async (batchData, $QueryFn) => {
      //
      this.tickers_sold=total_tickets_ebrite-season_tics_comps
    },
  },
  // 售票总数率
  per_sold_of_total: {
    type: 'varchar',
    round:1,
    formula: async (batchData, $QueryFn) => {
      //
      this.per_sold_of_total=(this.tickers_sold/this.total_tickets_ebrite).toFixed(2)
    },
  },
  // 总票数/容量
  per_total_of_capacity: {
    type: 'varchar',
    round:1,
    formula: async (batchData, $QueryFn) => {
      this.per_total_of_capacity=(this.total_tickets_ebrite/this.capacity).toFixed(2)
    },
  },
  // 输入的数据，团体票?
  number_of_groups: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.number_of_groups=batchData.no_of_groups;
    },
  },
  // 输入的数据，团体票大人?
  total_adults_groups: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.total_adults_groups = batchData.group_adults;
    },
  },
  // 输入的数据，团体票孩子?
  tot_child_groups: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.tot_child_groups = batchData.group_children;
    },
  },
  // 团票率？?
  total_tics_group_per: {
    type: 'varchar',
    round:1,
    formula: async (batchData, $QueryFn) => {
      // （成人票+儿童票）/总票
      this.total_tics_group_per=((this.total_adults_groups+this.tot_child_groups)/this.total_tickets_ebrite).toFixed(2)
    },
  },
  // ebrite买票收入
  income_gross_ebrite: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select SUM(total_paid) as sum from ticket_xls where order_type='Eventbrite Completed' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum;
      this.income_gross_ebrite=result
    },
  },
  // lbl card买票收入
  income_lbl_card_tics: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select SUM(total_paid) as sum from ticket_xls where order_type ='Paid Directly By Debit Card' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum;
      this.income_lbl_card_tics=result
    },
  },
  // 其他买票收入
  income_other_tics: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select SUM(total_paid) as sum from ticket_xls where order_type not in ('Paid Directly By Debit Card','Eventbrite Completed') and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum;
      this.income_other_tics=result
    },
  },
  // 团体票收入
  income_groups_tickets: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.income_groups_tickets = batchData.group_tickets_revenue;
    },
  },
  // 票总收入
  total_tics_income: {
    type: 'double',
    round:1,
    formula: async (batchData, $QueryFn) => {
      const baseFilter = `batch='${batchData.batch}'`;
      // Bundle收入
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Bundle%' and ${baseFilter}`
      const result = await $QueryFn(sql)[0].sum||0;
      // income_gross_ebrite+income_lbl_card_tics+income_other_tics+income_gtoups_tickets+result
      this.total_tics_income=this.income_gross_ebrite+this.income_lbl_card_tics+this.income_other_tics+this.income_gtoups_tickets+result
    },
  },
  // ebrite票的其他收入
  income_merch_other_ebrite: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.income_merch_other_ebrite = batchData.eventbrite_add_ons;
    },
  },
  // 团体票的其他收入
  income_merch_other_groups: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.income_merch_other_groups = batchData.group_add_ons_food;
    },
  },
  // 其他票的其他收入
  income_merch_other_none_group_packages: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 直接返回用户输入的batch数据
      this.income_merch_other_none_group_packages = batchData.other_add_ons_food;
    },
  },
  // 总的其他收入
  total_merch_other_income: {
    type: 'double',
    round:1,
    formula: async (batchData, $QueryFn) => {
      // 加一起
      this.total_merch_other_income = this.income_merch_other_ebrite+this.income_merch_other_groups+this.income_merch_other_none_group_packages;
    },
  },
  // 直接销售占比
  per_inc_direct_sales: {
    type: 'varchar',
    round:1,
    formula: async (batchData, $QueryFn) => {
      const all = this.total_tics_income + this.total_merch_other_income
      const baseFilter = `batch='${batchData.batch}'`;
      // Bundle收入
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Bundle%' and ${baseFilter}`
      const result = await $QueryFn(sql)[0].sum || 0;
      
      this.per_inc_direct_sales=((this.income_groups_tickets+this.income_merch_other_groups+result)/all).toFixed(2)
    },
  },
  // 团体占比
  per_income_groups: {
    type: 'varchar',
    round:1,
    formula: async (batchData, $QueryFn) => {
      const all =this.total_tics_income + this.total_merch_other_income
      // 算比值
      this.per_income_groups = ((this.income_groups_tickets+this.income_merch_other_groups)/all).toFixed(2);
    },
  },
  // 促销占比
  per_income_promos: {
    type: 'varchar',
    round:1,
    formula: async (batchData, $QueryFn) => {
      const all = this.total_tics_income + this.total_merch_other_income
      const baseFilter = `batch='${batchData.batch}'`;
      // Bundle收入
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Bundle%' and ${baseFilter}`
      const result = await $QueryFn(sql)[0].sum||0;
      // 算比值
      this.per_income_promos=(result/all).toFixed(2)
    },
  },
  // 带票的总收入
  total_income_tics_merch_other: {
    type: 'double',
    round:1,
    formula: async (batchData, $QueryFn) => {
      const all =this.total_tics_income + this.total_merch_other_income
      // 加一起
      this.total_income_tics_merch_other=all
    },
  },
  // 成人票总数
  total_adults: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Adult%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.total_adults=result
    },
  },
  // 特别票总数
  total_concessions: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Concession%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.total_concessions=result
    },
  },
  // 儿童票总数
  total_children: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Child%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.total_children=result
    },
  },
  // 家庭票1总数
  total_family1: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Family 1%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.total_family1=result
    },
  },
  // 家庭票2总数
  total_family2: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Family 2%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.total_family2=result
    },
  },
  // 成人票收入
  inc_audults: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Adult%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_audults=result
    },
  },
  // 特别票收入
  inc_concessions: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Concession%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_concessions=result
    },
  },
  // 儿童票收入
  inc_children: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Child%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_children=result
    },
  },
  // 家庭票1收入
  inc_family1: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Family 1%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_family1=result
    },
  },
  // 家庭票2收入
  inc_family2: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Family 2%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_family2=result
    },
  },
  // Early Bird 票数
  early_bird_tics: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Early Bird%' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.early_bird_tics=result
    },
  },
  // Advance 票数
  advance_tics: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Advance%' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.advance_tics=result
    },
  },
  // gameday 票数
  gameday_tics: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Gameday%' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.gameday_tics=result
    },
  },
  // 其他 票数
  other_tics: {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type not like '%Gameday%' and ticket_type NOT like '%Advance%' and ticket_type NOT like '%Early Bird%' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].cnt||0;
      this.other_tics=result
    },
  },
  // 平均票价
  ave_tics_per_purchase: {
    type: 'int',
    round:1,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      return null;
    },
  },
  // Early Bird 收入
  inc_early_bird: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Early Bird%' ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_early_bird=result
    },
  },
  // Advance 收入
  inc_advance: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Advance%' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_advance=result
    },
  },
  // gameday 收入
  inc_gameday: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Gameday%' and ${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_gameday=result
    },
  },
  // 其他 收入
  inc_other: {
    type: 'double',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type not like '%Gameday%' and ticket_type NOT like '%Advance%' and ticket_type NOT like '%Early Bird%' and${baseFilter}`;
      const result = await $QueryFn(sql)[0].sum||0;
      this.inc_other=result
    },
  },
  // 这TM算的啥啊
  ave_pound_per_purchase: {
    type: 'double',
    round:1,
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 本赛季第一次
  '1st_timers_this_season': {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // 在这个时间之前↓
      const game_date = moment(batchData.game_date)
      // 找赛季开始时间 赛季是每年的8月到次年的5月
      const season_start =game_date.month>5? moment(`${game_date,year()}-08`):moment(`${game_date,year()-1}-08`)
      return null;
    },
  },
  // 本赛季第二次
  '2nd_timers_this_season': {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 第一次来
  '1st_timers_ever': {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 第二次来
  '2nd_timers_ever': {
    type: 'int',
    round:0,
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 总付款账户
  total_paying_accounts: {
    type: 'int',
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 本赛季第一次占比
  per_1st_timers_this_season: {
    type: 'varchar',
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 本赛季第二次占比
  per_2nd_timers_this_season: {
    type: 'varchar',
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 第一次来占比
  per_1st_timers_ever: {
    type: 'varchar',
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 第二次来占比
  per_2st_timers_ever: {
    type: 'varchar',
    formula: async (batchData, $QueryFn) => {
      // ？？？
      return null;
    },
  },
  // 各类票数和占比 存json
  lr_promotions: {
    type: 'varchar',
    formula: async (batchData, $QueryFn) => {
      // 返回一个对象
      return {};
    },
  },
};

exports.columnMapper = columnMapper;
exports.reverseCol = reverseCol;
exports.COL_import_batch = COL_import_batch;
