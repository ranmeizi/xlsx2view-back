'use strict';

const Controller = require('egg').Controller;

class TestController extends Controller {
    async upload() {
        console.log(this.ctx.response)
        this.ctx.body='ok'
    }
}

module.exports = TestController;
