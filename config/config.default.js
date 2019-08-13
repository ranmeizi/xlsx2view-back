/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_boboan222';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: false,
    },
    domainWhiteList: [ 'http://localhost:8080' ],
  };
  const userConfig = {
    // myAppName: 'egg',
  };
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };
  // mysql 的配置
  config.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: 'localhost',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: 'UltraTel@5266',
      // 数据库名
      database: 'test_analyser',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };

  // 设置multipart的后缀格式
  config.multipart = {
    fileExtensions: [ '.xls', '.xlsx', '.xlsm' ],
  };

  return {
    ...config,
    ...userConfig,
  };
};
