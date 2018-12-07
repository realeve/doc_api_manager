# 最佳实践

在系统给出的默认调用代码中，对于前台、小程序都给出了 axios 这一函数，但 axios 官方文档中的数据返回结果与我们此前的数据约定并不一致。现在我们将前后台分离的开发中遇到的各类问题的解决方案总结如下。

## 原生 axios

假设默认返回数据结构定义如下：

```ts
type TItem = {
  [key: string | number]: string | number | void;
};

interface ApiSchema {
  data: Array<TItem>;
  rows: number;
  ip: string;
  header: Array<string>;
  title: string;
  time: string;
  source: string;
}
```

```ts
import axios from 'axios';

const baseUrl: string = '//localhost:90/api';
const getSampleFakeType = (type) =>
  axios({
    url: baseUrl + '/51/65b5c14441.json',
    params: {
      type
    }
  });

const handleData = async () => {
  let res: ApiSchema = await getSampleFakeType('score').then((res) => res.data);
  // 业务逻辑
};
```

[在原生 axios 调用](https://www.npmjs.com/package/axios)中，需要指定 API 地址，同时返回数据需要返回数据的 data 部分才是我们约定的数据。此处还未处理读取报错的场景，在实际使用中我们可以做以下的封装。

## web 端

```ts
// ./lib/setting.js
export let DEV: boolean = true; // 是否是调试模式

// 后台api部署域名
export let host: string = DEV
  ? 'http://localhost:90/api/'
  : 'http://10.8.1.25:100/api/';
```

```ts
// ./lib/axios.js
import http from 'axios';
import qs from 'qs';
import * as setting from './setting';
import { notification } from 'antd';
import router from 'umi/router';

export const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};

// 判断数据类型，对于FormData使用 typeof 方法会得到 object;
let getType: (data: any) => string = (data) =>
  Object.prototype.toString
    .call(data)
    .match(/\S+/g)[1]
    .replace(']', '')
    .toLowerCase();

export let axios = async (option) => {
  option = Object.assign(option, {
    method: option.method || 'get'
  });

  return await http
    .create({
      baseURL: setting.host,
      timeout: 10000,
      transformRequest: [
        function(data) {
          let dataType = getType(data);
          switch (dataType) {
            case 'object':
            case 'array':
              data = qs.stringify(data);
              break;
            default:
              break;
          }
          return data;
        }
      ]
    })(option)
    .then(({ data }) => data)
    .catch((error) => {
      if (error.response) {
        let { data, status } = error.response;

        // 根据不同的返回状态跳转到不同页面，用户可自行定义
        if (status === 401) {
          router.push('/unlogin');
        } else if (status === 403) {
          router.push('/403');
        } else if (status <= 504 && status >= 500) {
          router.push('/500');
        } else if (status >= 404 && status < 422) {
          router.push('/404');
        }

        // 全局弹出请求错误提示
        const errortext = (codeMessage[status] || '') + data.errmsg;
        notification.error({
          message: `请求错误 ${status}: ${error.config.url}`,
          description: errortext,
          duration: 10
        });
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
      return Promise.reject(error);
    });
};
```

接口集中定义

```ts
// ./db.js
import { axios } from '@/lib/axios';
/**
 *   @database: { 接口管理 }
 *   @desc:     { 部门列表 }
 */
export const getSysDept = () =>
  axios({
    url: '/27/9b520a55df.json'
  });
// 其它接口
```

业务逻辑

```ts
// 将变量名定义为db，表示与数据库读写数据
import * as db from './db';
async function readData() {
  let res: ApiSchema = await db.getSysDept();
  // 后续处理
}
```

## 微信小程序

以 wepy 框架为例：

```js
// axios.js
import wepy from 'wepy';
import clone from 'lodash.clone';
let host = 'https://api.yourDomain.com';

// wiki: https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
// 根据文档说明改写 wepy.request，适应web端axios调用的方式，兼容前台调用。
export const axios = (req) => {
  req.url = req.url || host;
  let url = req.url;
  if (!req.url.includes('https')) {
    url = host + req.url;
  }

  // 默认请求类型
  let method = req.method || 'GET';
  // 小程序需要大写请求类型
  method = method.toUpperCase();

  // 请求参数
  let data = req.params ? clone(req.params) : {};

  // 如果为POST，参数在 req.data中
  if (method === 'POST') {
    data = req.data;
  }
  return wepy.request({
    url,
    method,
    data
  });
};
```

调用

```js
import { axios } from './axios';

/**
 *   @database: { 微信开发 }
 *   @desc:     { 用户是否登录 }
 */
export const getPabUserlist = (openid) =>
  axios({
    url: '/106/9acd3f7b1f.json',
    params: {
      openid
    }
  });
```

## nodejs 端

```js
// axios.js
let http = require('axios');
let qs = require('qs');

let dev = false;

let host = dev ? 'http://127.0.0.1:90/api/' : 'http://10.8.1.25:100/api/';

// 判断数据类型，对于FormData使用 typeof 方法会得到 object;
let getType = (data) =>
  Object.prototype.toString
    .call(data)
    .match(/\S+/g)[1]
    .replace(']', '')
    .toLowerCase();

// 自动处理token更新，data 序列化等
let axios = async (option) => {
  option = Object.assign(option, {
    method: option.method || 'get'
  });

  return await http
    .create({
      baseURL: host,
      timeout: 10000,
      transformRequest: [
        function(data) {
          let dataType = getType(data);
          switch (dataType) {
            case 'object':
            case 'array':
              data = qs.stringify(data);
              break;
            default:
              break;
          }
          return data;
        }
      ]
    })(option)
    .then(({ data }) => data)
    .catch((e) => {
      console.log(e);
      return Promise.reject(e);
    });
};

module.exports = {
  axios,
  dev
};
```

## 中台应用

::: warning 有了 web 调用为什么还需要 nodejs 端？
为了保持后台的通用性，我们做了许多约定确保满足大部分应用场景。但有的数据接口需要调用大量不同数据库的接口，并且包含复杂的逻辑处理（例如自动排产），这时只有前台/后台还不能满足需要，此时需要引入中台。
:::

为方便说明，我们将系统间的数据流向设计如下：

```
                                     ┏━━━━━━━━━━━━━━━━━> 后台接口 1 ━━━━━> 数据库 1
                                     ┣━━━━━━━━━━━━━━━━━> 后台接口 2 ━━━━━> 数据库 2
前台 web ━━━━━━> 中台 Node.js 调用接口并处理业务逻辑 ━━━━━> 后台接口 3 ━━━━━> 数据库 3
                                     ┣━━━━━━━━━━━━━━━━━> 后台接口 4 ━━━━━> 数据库 4
                                     ┗━━━━━━━━━━━━━━━━━> 后台接口 5 ━━━━━> 数据库 5
```

此时，平台向 node 提供基础数据调用，Node.js 专注于接口间的逻辑处理并输出新的接口，而与数据库打交道的部分由平台完成。

## 数据离线 Mock

假设我们需要在离线开发模式调试线上的接口:

```ts
import { axios, dev } from '@/lib/axios';
/**
 *   @database: { 接口管理 }
 *   @desc:     { 部门列表 }
 */
export const getSysDept = () =>
  axios({
    url: '/27/9b520a55df.json'
  });
```

此时可以将数据内容存储为 mock 目录下的文件 _9b520a55df.json_ 如下：

```json
{
  "data": [{ "id": 1, "value": "某部门" }, { "id": 2, "value": "部门2" }],
  "rows": 2,
  "ip": "0.0.0.0",
  "header": ["id", "value"],
  "title": "部门列表",
  "time": "10.554ms",
  "source": "数据来源：接口管理"
}
```

此时手工将接口调用文件改为以下文件：

```ts
import { axios, dev } from '@/lib/axios';
/**
 *   @database: { 接口管理 }
 *   @desc:     { 部门列表 }
 */
export const getSysDept = () =>
  dev
    ? require('./mock/9b520a55df.json')
    : axios({
        url: '/27/9b520a55df.json'
      });
```

当为开发模式时，确保让 dev 设置为 true，这样便可保证线上环境不连通的情况下，正常测试开发了。
