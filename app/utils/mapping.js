'use strict';
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

const StatisticalTable = {
  // 系统用批次号
  'batch': {
    type: 'varchar',
    formula: (batchData) => {
      return batchData.batch
    }
  },
  // 对阵名称
  'opposition': {
    type: 'varchar',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据
      return batchData.opposition
    }
  },
  // 星期
  'weekday': {
    type: 'varchar',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据
      return batchData.weekday
    }
  },
  // 上次比赛间隔
  'days_since_prev_game': {
    type: 'int',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据
      return batchData.days_since_prev_game
    }
  },
  // ebrite售票总数
  'total_tickets_ebrite': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `select count(*) from ticket_xls where ${baseFilter}`
      return null
    }
  },
  // 检票总数
  'tickets_scanned': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `select count(*) from ticket_xls where attendee_status='Checked In' and ${baseFilter}`
      return null
    }
  },
  // 检票率
  'per_scanned': {
    type: 'varchar',
    formula: (batchData) => {
      // ?
      return null
    }
  },
  // ？？？
  'capacity': {
    type: 'int',
    formula: (batchData) => {
      // ?
      return null
    }
  },
  // 季票？？？
  'season_tics_comps': {
    type: 'int',
    formula: (batchData) => {
      // 
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `select count(*) from ticket_xls where total_paid!='0'  and ticket_type not like '%Bundle%' and ${baseFilter}`
      // result - batchData.group_adults - batchData.group_children - batchData.spare_comps_printed 
      return null
    }
  },
  // 售票总数
  'tickers_sold': {
    type: 'int',
    formula: (batchData) => {
      // 
      return null
    }
  },
  // 售票总数率
  'per_sold_of_total': {
    type: 'varchar',
    formula: (batchData) => {
      // 
      return null
    }
  },
  // capacity比???
  'per_total_of_capacity': {
    type: 'varchar',
    formula: (batchData) => {
      // 
      return null
    }
  },
  // 输入的数据，团体票?
  'number_of_groups': {
    type: 'int',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据 
      return batchData.no_of_groups
    }
  },
  // 输入的数据，团体票大人?
  'total_adults_groups': {
    type: 'int',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据 
      return batchData.group_adults
    }
  },
  // 输入的数据，团体票孩子?
  'tot_child_groups': {
    type: 'int',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据
      return batchData.group_children
    }
  },
  // 团票率？?
  'total_tics_group_per': {
    type: 'varchar',
    formula: (batchData) => {
      // 计算比值
      return null
    }
  },
  // ebrite买票收入
  'income_gross_ebrite': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `select SUM(total_paid) from ticket_xls where order_type='Eventbrite Completed' and ${baseFilter}`
      return null
    }
  },
  // lbl card买票收入
  'income_lbl_card_tics': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `select SUM(total_paid) from ticket_xls where order_type ='Paid Directly By Debit Card' and ${baseFilter}`
      return null
    }
  },
  // 其他买票收入
  'income_other_tics': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `select SUM(total_paid) from ticket_xls where order_type not in ('Paid Directly By Debit Card','Eventbrite Completed') and ${baseFilter}`
      return null
    }
  },
  // 团体票收入
  'income_gtoups_tickets': {
    type: 'double',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据
      return batchData.group_tickets_revenue
    }
  },
  // 总收入
  'total_tics_income': {
    type: 'double',
    formula: (batchData) => {
      // 加一起
      return null
    }
  },
  // ebrite票的其他收入
  'income_merch_other_ebrite': {
    type: 'double',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据
      return batchData.eventbrite_add_ons
    }
  },
  // 团体票的其他收入
  'income_merch_other_groups': {
    type: 'double',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据
      return batchData.group_add_ons_food
    }
  },
  // 其他票的其他收入
  'income_merch_other_none_group_packages': {
    type: 'double',
    formula: (batchData) => {
      // 直接返回用户输入的batch数据
      return batchData.other_add_ons_food
    }
  },
  // 总的其他收入
  'total_merch_other_income': {
    type: 'double',
    formula: (batchData) => {
      // 加一起
      return null
    }
  },
  // 直接销售占比
  'per_inc_direct_sales': {
    type: 'varchar',
    formula: (batchData) => {
      // 算比值
      return null
    }
  },
  // 团体占比
  'per_income_groups': {
    type: 'varchar',
    formula: (batchData) => {
      // 算比值
      return null
    }
  },
  // 促销占比
  'per_income_promos': {
    type: 'varchar',
    formula: (batchData) => {
      // 算比值
      return null
    }
  },
  // 带票的总收入
  'total_income_tics_merch_other': {
    type: 'double',
    formula: (batchData) => {
      // 加一起
      return null
    }
  },
  // 成人票总数
  'total_adults': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 特别票总数
  'total_concessions': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 儿童票总数
  'total_children': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 家庭票1总数
  'total_family1': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 家庭票2总数
  'total_family2': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 成人票收入
  'inc_audults': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 特别票收入
  'inc_concessions': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 儿童票收入
  'inc_children': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 家庭票1收入
  'inc_family1': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // 家庭票2收入
  'inc_family2': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // Early Bird 票数
  'early_bird_tics': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Early Bird%' and ${baseFilter}`
      return null
    }
  },
  // Advance 票数
  'advance_tics': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Advance%' and ${baseFilter}`
      return null
    }
  },
  // gameday 票数
  'gameday_tics': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type like '%Gameday%' and ${baseFilter}`
      return null
    }
  },
  // 其他 票数
  'other_tics': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `SELECT count(*) as cnt from ticket_xls where ticket_type not like '%Gameday%' and ticket_type NOT like '%Advance%' and ticket_type NOT like '%Early Bird%' and ${baseFilter}`
      return null
    }
  },
  // 平均票价
  'ave_tics_per_purchase': {
    type: 'int',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      return null
    }
  },
  // Early Bird 收入
  'inc_early_bird': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `SELECT SUM(total_paid) as cnt from ticket_xls where ticket_type like '%Early Bird%' ${baseFilter}`
      return null
    }
  },
  // Advance 收入
  'inc_advance': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `SELECT SUM(total_paid) as cnt from ticket_xls where ticket_type like '%Advance%' and ${baseFilter}`
      return null
    }
  },
  // gameday 收入
  'inc_gameday': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `SELECT SUM(total_paid) as cnt from ticket_xls where ticket_type like '%Gameday%' and ${baseFilter}`
      return null
    }
  },
  // 其他 收入
  'inc_other': {
    type: 'double',
    formula: (batchData) => {
      // sql查询xlsData的表获取结果
      const baseFilter = `batch='${batchData.batch}'`
      const sql = `SELECT SUM(total_paid) as cnt from ticket_xls where ticket_type not like '%Gameday%' and ticket_type NOT like '%Advance%' and ticket_type NOT like '%Early Bird%' and${baseFilter}`
      return null
    }
  },
  // 这TM算的啥啊
  'ave_pound_per_purchase': {
    type: 'double',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 本赛季第一次
  '1st_timers_this_season': {
    type: 'int',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 本赛季第二次
  '2nd_timers_this_season': {
    type: 'int',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 第一次来
  '1st_timers_ever': {
    type: 'int',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 第二次来
  '2nd_timers_ever': {
    type: 'int',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 总付款账户
  'total_paying_accounts': {
    type: 'int',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 本赛季第一次占比
  'per_1st_timers_this_season': {
    type: 'varchar',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 本赛季第二次占比
  'per_2nd_timers_this_season': {
    type: 'varchar',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 第一次来占比
  'per_1st_timers_ever': {
    type: 'varchar',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 第二次来占比
  'per_2st_timers_ever': {
    type: 'varchar',
    formula: (batchData) => {
      // ？？？
      return null
    }
  },
  // 各类票数和占比 存json
  'lr_promotions': {
    type: 'varchar',
    formula: (batchData) => {
      // 返回一个对象
      return {}
    }
  },
}


exports.columnMapper = columnMapper;
exports.reverseCol = reverseCol;
exports.COL_import_batch = COL_import_batch;
