# 最佳实践

在系统给出的默认调用代码中，对于前台、小程序都给出了 axios 这一函数，但 axios 官方文档中的数据返回结果与我们此前的数据约定并不一致。

## 原生 axios 调用

默认数据结构定义如下：

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

在原生 axios 调用中，需要指定 API 地址，同时返回数据需要返回数据的 data 部分才是我们约定的数据。此处还未处理读取报错的场景，在实际使用中我们可以这样封装。

## web 端封装 axios

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
    method: option.method ? option.method : 'get'
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
import * as db from './db';
async function readData() {
  let res: ApiSchema = await db.getSysDept();
  // 后续处理
}
```

## 微信小程序调用

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
let fs = require('fs');

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
    method: option.method ? option.method : 'get'
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
