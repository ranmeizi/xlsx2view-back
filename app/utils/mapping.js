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

exports.columnMapper = columnMapper;
exports.reverseCol = reverseCol;