---
home: true
heroImage: /logo.svg
actionText: 快速上手 →
actionLink: /guide/
features:
  - title: 接口鉴权
    details: 基于JWT的接口鉴权，将用户身份状态与后端剥离，方便横向扩展，分布式部署。
  - title: 快速高效
    details: 基于PHP7.0，根据不同使用场景精准提供前后端数据缓存方案。
  - title: 自动生成调用代码
    details: 一键生成前台调用代码。函数名、变量、参数、接口注释自动适配。
  - title: 满足各种应用场景
    details: 系统提供RPC/Restful调用方式，JSON/XML数据格式，HTTP/Websocket协议，新老项目平滑过渡。
  - title: 内外网支持
    details: 目前已在公司(Node后端、Web前端、微信小程序)多个信息化系统中应用，外网支持阿里云、新浪云等主流云平台。
  - title: 通用化
    details: 与业务完全解耦，凝练多年前后端分离开发经验，满足各类数据报表、图表、数据表单操作等场景，数据输出格式统一，抹平接口格式差异。
footer: © 2018 成都印钞有限公司 印钞管理部
---

```js
// 接口列表：
// db.js
import axios from './axios';
/**
 *   @database: { 接口管理 }
 *   @desc:     { 测试数据-查询指定类型数据 }
 */
export const getSampleBar = data_type => axios({
  url: '/6/8d5b63370c.json',
  params: {
    data_type
  },
});


/** 数据量较大时建议使用post模式：
*
 *   @database: { 接口管理 }
 *   @desc:     { 测试数据-查询指定类型数据 }
 */
export const getSampleBar = data_type => axios({
  method: 'post',
  data: {
    data_type,
    id: 6,
    nonce: '8d5b63370c'
  },
});


/** NodeJS服务端调用：
*
 *   @database: { 接口管理 }
 *   @desc:     { 测试数据-查询指定类型数据 }
 */
module.exports.getSampleBar = data_type => axios({
  url: '/6/8d5b63370c.json',
  params: {
    data_type
  },
});

---------------------------------------

// 业务逻辑
// index.js
import * as db from './db.js'
async fetchData(){
  let res = await db.getSampleBar('score');
  ...
}

---------------------------------------

// 返回结果
{
  "data": [{
    "id": 7,
    "data_type": "score",
    "track_desc": "得分",
    "data_value": "0",
    "data_count": 16315
  }, {
    "id": 8,
    "data_type": "score",
    "track_desc": "得分",
    "data_value": "10",
    "data_count": 85132
  }, {
    "id": 9,
    "data_type": "score",
    "track_desc": "得分",
    "data_value": "20",
    "data_count": 235152
  }, {
    "id": 10,
    "data_type": "score",
    "track_desc": "得分",
    "data_value": "30",
    "data_count": 468738
  }],
  "rows": 4,
  "ip": "10.8.18.66",
  "header": ["id", "data_type", "track_desc", "data_value", "data_count"],
  "title": "测试数据-查询指定类型数据",
  "time": "7.091ms",
  "source": "数据来源：接口管理"
}

```
