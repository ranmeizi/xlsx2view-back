'use strict';
const moment = require('moment');

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
formula:计算公式
*/
const DetailGroup = {
  base: {
    lable: '',
    index: 0,
  },
  Ticketing: {
    label: 'Ticketing',
    index: 1,
  },
  'Income tickets': {
    label: 'Income tickets',
    index: 2,
  },
  'Income Merch/Other': {
    label: 'Income Merch/Other',
    index: 3,
  },
  'Total Income': {
    label: 'Total Income',
    index: 4,
  },
  'Sales by Ticket Type': {
    label: 'Sales by Ticket Type',
    index: 5,
  },
  'Sales by Ticket Tier': {
    label: 'Sales by Ticket Tier',
    index: 6,
  },
  'Customer Analysis': {
    label: 'Customer Analysis',
    index: 7,
  },
};

const fixType = {
  Percentage: '%',
  Money: '£',
};

const StatisticalTable = {
  // 系统用批次号
  batch: {
    type: 'varchar',
    group: 'base',
    label: 'Batch Name',
    showType: 0,
    round: 0,
    async formula(batchData, $QueryFn) {
      this.batch = batchData.batch;
    },
  },
  game_date: {
    type: 'varchar',
    round: 0,
    showType: 0,
    group: 'base',
    label: 'Game Day',
    async formula(batchData, $QueryFn) {
      this.game_date = batchData.game_date;
    },
  },
  // 对阵名称
  opposition: {
    type: 'varchar',
    round: 0,
    showType: 0,
    group: 'base',
    label: 'Opposition',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.opposition = batchData.opposition;
    },
  },
  // 星期
  weekday: {
    type: 'varchar',
    round: 0,
    showType: 0,
    group: 'base',
    label: 'Day',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.weekday = batchData.weekday;
    },
  },
  // 上次比赛间隔
  days_since_prev_game: {
    type: 'int',
    round: 0,
    showType: 0,
    group: 'base',
    label: 'Days from Last Game',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.days_since_prev_game = batchData.days_since_prev_game;
    },
  },
  // ebrite售票总数
  total_tickets_ebrite: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Ticketing',
    label: "Total Tickets('brite)",
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select count(*) as cnt from ticket_xls where ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.total_tickets_ebrite = result[0].cnt || 0;
    },
  },
  // 检票总数
  tickets_scanned: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Ticketing',
    label: 'Tickets Scanned',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select count(*) as cnt from ticket_xls where attendee_status='Checked In' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.tickets_scanned = result[0].cnt || 0;
    },
  },
  // 检票率
  per_scanned: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Ticketing',
    label: '% scanned',
    async formula(batchData, $QueryFn) {
      this.per_scanned = (
        this.tickets_scanned / this.total_tickets_ebrite
      ).toFixed(2);
    },
  },
  // 容量，这是个常量
  capacity: {
    type: 'int',
    round: 0,
    showType: 0,
    group: 'Ticketing',
    label: 'Capacity!',
    async formula(batchData, $QueryFn) {
      // 这是个常量
      this.capacity = 2185;
    },
  },
  // 季票？？？
  season_tics_comps: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Ticketing',
    label: 'Season Tics/Comps',
    async formula(batchData, $QueryFn) {
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select count(*) as cnt from ticket_xls where total_paid!='0'  and ticket_type not like '%Bundle%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.season_tics_comps = result[0].cnt || 0;
    },
  },
  // ???total_tickets_ebrite-season_tics_comps  不知道啥意义但是原来就是这个公式
  tickers_sold: {
    type: 'int',
    round: 1,
    showType: 2,
    group: 'Ticketing',
    label: 'Tickets Sold',
    async formula(batchData, $QueryFn) {
      //
      this.tickers_sold = this.total_tickets_ebrite - this.season_tics_comps;
    },
  },
  // 售票总数率
  per_sold_of_total: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Ticketing',
    label: '% sold of total',
    async formula(batchData, $QueryFn) {
      //
      this.per_sold_of_total = (
        this.tickers_sold / this.total_tickets_ebrite
      ).toFixed(2);
    },
  },
  // 总票数/容量
  per_total_of_capacity: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Ticketing',
    label: '% total of capacity',
    async formula(batchData, $QueryFn) {
      this.per_total_of_capacity = (
        this.total_tickets_ebrite / this.capacity
      ).toFixed(2);
    },
  },
  // 输入的数据，团体票?
  number_of_groups: {
    type: 'int',
    round: 0,
    showType: 0,
    group: 'Ticketing',
    label: 'Number of Groups',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.number_of_groups = batchData.no_of_groups;
    },
  },
  // 输入的数据，团体票大人?
  total_adults_groups: {
    type: 'int',
    round: 0,
    showType: 0,
    group: 'Ticketing',
    label: 'Total Adults(groups)',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.total_adults_groups = batchData.group_adults;
    },
  },
  // 输入的数据，团体票孩子?
  tot_child_groups: {
    type: 'int',
    round: 0,
    showType: 0,
    group: 'Ticketing',
    label: 'Tot Child(groups)',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.tot_child_groups = batchData.group_children;
    },
  },
  // 团票率？?
  total_tics_group_per: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Ticketing',
    label: 'Total Tics Group %',
    async formula(batchData, $QueryFn) {
      // （成人票+儿童票）/总票
      this.total_tics_group_per = (
        (this.total_adults_groups + this.tot_child_groups) /
        this.total_tickets_ebrite
      ).toFixed(2);
    },
  },
  // ebrite买票收入
  income_gross_ebrite: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Income tickets',
    label: "Income Gross(E'brite)",
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select SUM(total_paid) as sum from ticket_xls where order_type='Eventbrite Completed' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.income_gross_ebrite = result[0].sum || 0;
    },
  },
  // lbl card买票收入
  income_lbl_card_tics: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Income tickets',
    label: 'Income LBL card tics',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select SUM(total_paid) as sum from ticket_xls where order_type ='Paid Directly By Debit Card' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.income_lbl_card_tics = result[0].sum || 0;
    },
  },
  // 其他买票收入
  income_other_tics: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Income tickets',
    label: 'Income other tics',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select SUM(total_paid) as sum from ticket_xls where order_type not in ('Paid Directly By Debit Card','Eventbrite Completed') and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.income_other_tics = result[0].sum || 0;
    },
  },
  // 团体票收入
  income_groups_tickets: {
    type: 'double',
    round: 0,
    showType: 0,
    prefix: fixType.Money,
    group: 'Income tickets',
    label: 'Income Groups tickets',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.income_groups_tickets = batchData.group_tickets_revenue;
    },
  },
  // 票总收入
  total_tics_income: {
    type: 'double',
    round: 1,
    showType: 2,
    prefix: fixType.Money,
    group: 'Income tickets',
    label: 'Total Tics income',
    async formula(batchData, $QueryFn) {
      const baseFilter = `batch='${batchData.batch}'`;
      // Bundle收入
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Bundle%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      // income_gross_ebrite+income_lbl_card_tics+income_other_tics+income_gtoups_tickets+result
      this.total_tics_income =
        this.income_gross_ebrite +
          this.income_lbl_card_tics +
          this.income_other_tics +
          this.income_groups_tickets +
          result[0].sum || 0;
    },
  },
  // ebrite票的其他收入
  income_merch_other_ebrite: {
    type: 'double',
    round: 0,
    showType: 0,
    prefix: fixType.Money,
    group: 'Income Merch/Other',
    label: "Income merch/other(E'brite)",
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.income_merch_other_ebrite = batchData.eventbrite_add_ons;
    },
  },
  // 团体票的其他收入
  income_merch_other_groups: {
    type: 'double',
    round: 0,
    showType: 0,
    prefix: fixType.Money,
    group: 'Income Merch/Other',
    label: 'Income merch/other(Groups)',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.income_merch_other_groups = batchData.group_add_ons_food;
    },
  },
  // 其他票的其他收入
  income_merch_other_none_group_packages: {
    type: 'double',
    round: 0,
    showType: 0,
    prefix: fixType.Money,
    group: 'Income Merch/Other',
    label: 'Income merch/other(Non-GroupPackages)',
    async formula(batchData, $QueryFn) {
      // 直接返回用户输入的batch数据
      this.income_merch_other_none_group_packages =
        batchData.other_add_ons_food;
    },
  },
  // 总的其他收入
  total_merch_other_income: {
    type: 'double',
    round: 1,
    showType: 2,
    prefix: fixType.Money,
    group: 'Income Merch/Other',
    label: 'Total Merch/other income',
    async formula(batchData, $QueryFn) {
      // 加一起
      this.total_merch_other_income =
        this.income_merch_other_ebrite +
        this.income_merch_other_groups +
        this.income_merch_other_none_group_packages;
    },
  },
  // 直接销售占比
  per_inc_direct_sales: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Total Income',
    label: '% inc direct sales',
    async formula(batchData, $QueryFn) {
      const all = this.total_tics_income + this.total_merch_other_income;
      const baseFilter = `batch='${batchData.batch}'`;
      // Bundle收入
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Bundle%' and ${baseFilter}`;
      const result = await $QueryFn(sql);

      this.per_inc_direct_sales = (
        (this.income_groups_tickets +
          this.income_merch_other_groups +
          result[0].sum || 0) / all
      ).toFixed(2);
    },
  },
  // 团体占比
  per_income_groups: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Total Income',
    label: '% inc groups',
    async formula(batchData, $QueryFn) {
      const all = this.total_tics_income + this.total_merch_other_income;
      // 算比值
      this.per_income_groups = (
        (this.income_groups_tickets + this.income_merch_other_groups) /
        all
      ).toFixed(2);
    },
  },
  // 促销占比
  per_income_promos: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Total Income',
    label: '% income promos',
    async formula(batchData, $QueryFn) {
      const all = this.total_tics_income + this.total_merch_other_income;
      const baseFilter = `batch='${batchData.batch}'`;
      // Bundle收入
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Bundle%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      // 算比值
      this.per_income_promos = (result[0].sum || 0 / all).toFixed(2);
    },
  },
  // 带票的总收入
  total_income_tics_merch_other: {
    type: 'double',
    round: 1,
    showType: 2,
    prefix: fixType.Money,
    group: 'Total Income',
    label: '% Total Income(tics,merch,other)',
    async formula(batchData, $QueryFn) {
      const all = this.total_tics_income + this.total_merch_other_income;
      // 加一起
      this.total_income_tics_merch_other = all;
    },
  },
  // 成人票总数
  total_adults: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Sales by Ticket Type',
    label: 'Total Adults',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Adult%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.total_adults = result[0].cnt || 0;
    },
  },
  // 特别票总数
  total_concessions: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Sales by Ticket Type',
    label: 'Total Concessions',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Concession%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.total_concessions = result[0].cnt || 0;
    },
  },
  // 儿童票总数
  total_children: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Sales by Ticket Type',
    label: 'Total Children',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Child%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.total_children = result[0].cnt || 0;
    },
  },
  // 家庭票1总数
  total_family1: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Sales by Ticket Type',
    label: 'Total Family1',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Family 1%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.total_family1 = result[0].cnt || 0;
    },
  },
  // 家庭票2总数
  total_family2: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Sales by Ticket Type',
    label: 'Total Family2',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Family 2%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.total_family2 = result[0].cnt || 0;
    },
  },
  // 成人票收入
  inc_audults: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Sales by Ticket Type',
    label: 'Inc Adults',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Adult%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_audults = result[0].sum || 0;
    },
  },
  // 特别票收入
  inc_concessions: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Sales by Ticket Type',
    label: 'Inc Concessions',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Concession%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_concessions = result[0].sum || 0;
    },
  },
  // 儿童票收入
  inc_children: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Sales by Ticket Type',
    label: 'Inc Children',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Child%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_children = result[0].sum || 0;
    },
  },
  // 家庭票1收入
  inc_family1: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Sales by Ticket Type',
    label: 'Inc Family1',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Family 1%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_family1 = result[0].sum || 0;
    },
  },
  // 家庭票2收入
  inc_family2: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Sales by Ticket Type',
    label: 'Inc Family2',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Family 2%' and total_paid!='0' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_family2 = result[0].sum || 0;
    },
  },
  // Early Bird 票数
  early_bird_tics: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Sales by Ticket Tier',
    label: 'Early Bird tics',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Early Bird%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.early_bird_tics = result[0].cnt || 0;
    },
  },
  // Advance 票数
  advance_tics: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Sales by Ticket Tier',
    label: 'Advance tics',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Advance%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.advance_tics = result[0].cnt || 0;
    },
  },
  // gameday 票数
  gameday_tics: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Sales by Ticket Tier',
    label: 'Gameday tics',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Gameday%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.gameday_tics = result[0].cnt || 0;
    },
  },
  // 其他 票数
  other_tics: {
    type: 'int',
    round: 0,
    showType: 2,
    group: 'Sales by Ticket Tier',
    label: 'Other tics',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type not like '%Gameday%' and ticket_type NOT like '%Advance%' and ticket_type NOT like '%Early Bird%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.other_tics = result[0].cnt || 0;
    },
  },
  // 平均票价
  ave_tics_per_purchase: {
    type: 'int',
    round: 1,
    showType: 2,
    prefix: fixType.Money,
    group: 'Sales by Ticket Tier',
    label: 'Ave Tics Per Purchase',
    async formula(batchData, $QueryFn) {
      this.ave_tics_per_purchase = (
        (this.early_bird_tics +
          this.advance_tics +
          this.gameday_tics +
          this.other_tics) /
        this.total_paying_accounts
      ).toFixed(2);
    },
  },
  // Early Bird 收入
  inc_early_bird: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Sales by Ticket Tier',
    label: 'Inc Early Bird',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Early Bird%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_early_bird = result[0].sum || 0;
    },
  },
  // Advance 收入
  inc_advance: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Sales by Ticket Tier',
    label: 'Inc Advance',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Advance%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_advance = result[0].sum || 0;
    },
  },
  // gameday 收入
  inc_gameday: {
    type: 'double',
    round: 0,
    showType: 1,
    prefix: fixType.Money,
    group: 'Sales by Ticket Tier',
    label: 'Inc Gameday',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type like '%Gameday%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_gameday = result[0].sum || 0;
    },
  },
  // 其他 收入
  inc_other: {
    type: 'double',
    round: 0,
    showType: 2,
    prefix: fixType.Money,
    group: 'Sales by Ticket Tier',
    label: 'Inc Other',
    async formula(batchData, $QueryFn) {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `SELECT SUM(total_paid) as sum from ticket_xls where ticket_type not like '%Gameday%' and ticket_type NOT like '%Advance%' and ticket_type NOT like '%Early Bird%' and ${baseFilter}`;
      const result = await $QueryFn(sql);
      this.inc_other = result[0].sum || 0;
    },
  },
  // 这TM算的啥啊
  ave_pound_per_purchase: {
    type: 'double',
    round: 1,
    showType: 1,
    suffix: fixType.Percentage,
    group: 'Sales by Ticket Tier',
    label: 'Ave £ per purchase',
    async formula(batchData, $QueryFn) {
      this.ave_pound_per_purchase = (
        (this.inc_early_bird +
          this.inc_advance +
          this.inc_gameday +
          this.inc_other) /
        this.total_paying_accounts
      ).toFixed(2);
    },
  },
  // 本赛季第一次
  '1st_timers_this_season': {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Customer Analysis',
    label: '1st timers this season',
    async formula(batchData, $QueryFn) {
      const baseFilter = `batch='${batchData.batch}'`;

      // 用这个时间找赛季
      const game_date = moment(batchData.game_date);
      // 找赛季开始时间 赛季是每年的8月到次年的5月,没办法上推一个月，是订票日期，给他1个月缓冲
      const season_start =
        game_date.month > 5
          ? moment(`${game_date.year()}-07`)
          : moment(`${game_date.year() - 1}-07`);
      const seasonFilter = `order_date>'${season_start}'`;
      // 选择用email区分，email不会重复，找出所有需要统计的email上一次订票日期
      let sql = `select email,order_date from(select email,order_date from ticket_xls where order_date<(select MIN(order_date) from ticket_xls where ${baseFilter}) and ${seasonFilter} ORDER BY order_date desc) as a group by email `;

      // 这个查出赛季开始到batch为止每个email最后一次订票日期
      const _2stList = await $QueryFn(sql);

      // 本次batch的email列表
      sql = `select email from ticket_xls where ${baseFilter} group by email`;
      const emailList = await $QueryFn(sql);

      let count_1st = 0;
      let count_2st = 0;
      // 循环emaillist
      emailList.forEach(item => {
        // 如果_2stList中有对应结果，2st+1，如果没有1st+1
        if (_2stList.some(_2stItem => _2stItem.email === item.email)) {
          count_2st++;
        } else {
          count_1st++;
        }
      });

      this['1st_timers_this_season'] = count_1st;
    },
  },
  // 本赛季第二次
  '2nd_timers_this_season': {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Customer Analysis',
    label: '2nd timers this season',
    async formula(batchData, $QueryFn) {
      const baseFilter = `batch='${batchData.batch}'`;

      // 用这个时间找赛季
      const game_date = moment(batchData.game_date);
      // 找赛季开始时间 赛季是每年的8月到次年的5月,没办法上推一个月，是订票日期，给他1个月缓冲
      const season_start =
        game_date.month > 5
          ? moment(`${game_date.year()}-07`)
          : moment(`${game_date.year() - 1}-07`);
      const seasonFilter = `order_date>'${season_start}'`;
      // 选择用email区分，email不会重复，找出所有需要统计的email上一次订票日期
      let sql = `select email,order_date from(select email,order_date from ticket_xls where order_date<(select MIN(order_date) from ticket_xls where ${baseFilter}) and ${seasonFilter} ORDER BY order_date desc) as a group by email `;

      // 这个查出赛季开始到batch为止每个email最后一次订票日期
      const _2stList = await $QueryFn(sql);

      // 本次batch的email列表
      sql = `select email from ticket_xls where ${baseFilter} group by email`;
      const emailList = await $QueryFn(sql);

      let count_1st = 0;
      let count_2st = 0;
      // 循环emaillist
      emailList.forEach(item => {
        // 如果_2stList中有对应结果，2st+1，如果没有1st+1
        if (_2stList.some(_2stItem => _2stItem.email === item.email)) {
          count_2st++;
        } else {
          count_1st++;
        }
      });

      this['2nd_timers_this_season'] = count_2st;
    },
  },
  // 第一次来
  '1st_timers_ever': {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Customer Analysis',
    label: '1st timers ever',
    async formula(batchData, $QueryFn) {
      const baseFilter = `batch='${batchData.batch}'`;

      // 选择用email区分，email不会重复，找出所有需要统计的email上一次订票日期
      let sql = `select email,order_date from(select email,order_date from ticket_xls where order_date<(select MIN(order_date) from ticket_xls where ${baseFilter}) ORDER BY order_date desc) as a group by email `;

      // 这个查出赛季开始到batch为止每个email最后一次订票日期
      const _2stList = await $QueryFn(sql);

      // 本次batch的email列表
      sql = `select email from ticket_xls where ${baseFilter} group by email`;
      const emailList = await $QueryFn(sql);

      let count_1st = 0;
      let count_2st = 0;
      // 循环emaillist
      emailList.forEach(item => {
        // 如果_2stList中有对应结果，2st+1，如果没有1st+1
        if (_2stList.some(_2stItem => _2stItem.email === item.email)) {
          count_2st++;
        } else {
          count_1st++;
        }
      });
      this['1st_timers_ever'] = count_1st;
    },
  },
  // 第二次来
  '2nd_timers_ever': {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Customer Analysis',
    label: '2nd timers ever',
    async formula(batchData, $QueryFn) {
      const baseFilter = `batch='${batchData.batch}'`;

      // 选择用email区分，email不会重复，找出所有需要统计的email上一次订票日期
      let sql = `select email,order_date from(select email,order_date from ticket_xls where order_date<(select MIN(order_date) from ticket_xls where ${baseFilter}) ORDER BY order_date desc) as a group by email `;

      // 这个查出赛季开始到batch为止每个email最后一次订票日期
      const _2stList = await $QueryFn(sql);

      // 本次batch的email列表
      sql = `select email from ticket_xls where ${baseFilter} group by email`;
      const emailList = await $QueryFn(sql);

      let count_1st = 0;
      let count_2st = 0;
      // 循环emaillist
      emailList.forEach(item => {
        // 如果_2stList中有对应结果，2st+1，如果没有1st+1
        if (_2stList.some(_2stItem => _2stItem.email === item.email)) {
          count_2st++;
        } else {
          count_1st++;
        }
      });

      this['2nd_timers_ever'] = count_2st;
    },
  },
  // 总付款账户
  total_paying_accounts: {
    type: 'int',
    round: 0,
    showType: 1,
    group: 'Customer Analysis',
    label: 'Total Paying Accounts',
    async formula(batchData, $QueryFn) {
      const baseFilter = `batch='${batchData.batch}'`;
      const sql = `select count(*)as cnt from (select * from ticket_xls where total_paid>0 and ${baseFilter} GROUP BY email) as a`;
      const result = await $QueryFn(sql);
      this.total_paying_accounts = result[0].cnt || 0;
    },
  },
  // 本赛季第一次占比
  per_1st_timers_this_season: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Customer Analysis',
    label: '% 1st timers this season',
    async formula(batchData, $QueryFn) {
      this.per_1st_timers_this_season = (
        this['1st_timers_this_season'] / this.total_paying_accounts
      ).toFixed(2);
    },
  },
  // 本赛季第二次占比
  per_2nd_timers_this_season: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Customer Analysis',
    label: '% 2nd timers this season',
    async formula(batchData, $QueryFn) {
      this.per_2nd_timers_this_season = (
        this['2nd_timers_this_season'] / this.total_paying_accounts
      ).toFixed(2);
    },
  },
  // 第一次来占比
  per_1st_timers_ever: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Customer Analysis',
    label: '% 1st timers ever',
    async formula(batchData, $QueryFn) {
      this.per_1st_timers_ever = (
        this['1st_timers_ever'] / this.total_paying_accounts
      ).toFixed(2);
    },
  },
  // 第二次来占比
  per_2nd_timers_ever: {
    type: 'varchar',
    round: 1,
    showType: 2,
    suffix: fixType.Percentage,
    group: 'Customer Analysis',
    label: '% 2nd timers ever',
    async formula(batchData, $QueryFn) {
      this.per_2nd_timers_ever = (
        this['2nd_timers_ever'] / this.total_paying_accounts
      ).toFixed(2);
    },
  },
  // 各类票数和占比 存json
  lr_promotions: {
    type: 'varchar',
    round: 1,
    showType: 2,
    group: 'Customer Analysis',
    label: '% 2nd timers ever',
    async formula(batchData, $QueryFn) {
      // 查出groupby discount的条数和totalpaid总和
      const baseFilter = `batch='${batchData.batch}'`;
      let sql = `select discount,COUNT(*) as cnt,SUM(total_paid)as sum from ticket_xls where discount!=\'\' and discount not like \'%100.00%\' and ${baseFilter} GROUP BY discount`;
      const result_discount = await $QueryFn(sql);
      // 返回一个对象
      const lr_promotions = {};

      sql = `select count(*) as cnt, SUM(total_paid)as sum from ticket_xls WHERE ticket_type like '%Bundle%' and ${baseFilter}`;
      const result_bundle = await $QueryFn(sql);
      // bundle 数据
      const { tickers_sold, total_tics_income } = this;
      lr_promotions.Bundle = {
        count: result_bundle[0].cnt || 0,
        sum: result_bundle[0].sum || 0,
        per: (result_bundle[0].cnt || 0 / tickers_sold).toFixed(2),
      };
      // 所有优惠数据
      let total_count = 0;
      let total_sum = 0;
      result_discount.forEach(item => {
        total_count += item.cnt;
        total_sum += item.sum;
        lr_promotions[item.discount] = {
          count: item.cnt || 0,
          sum: item.sum || 0,
          per: (item.cnt || 0 / tickers_sold).toFixed(2),
        };
      });
      // 总数据
      lr_promotions.total = {
        count: total_count,
        sum: total_sum,
        per: (total_count / tickers_sold).toFixed(2),
        pet1: (total_sum / total_tics_income).toFixed(2),
      };
      this.lr_promotions = JSON.stringify(lr_promotions);
    },
  },
};

exports.columnMapper = columnMapper;
exports.reverseCol = reverseCol;
exports.COL_import_batch = COL_import_batch;
exports.StatisticalTable = StatisticalTable;
exports.DetailGroup = DetailGroup;
