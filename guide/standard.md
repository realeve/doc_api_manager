# 前后台约定

在这一章节，我们讨论在前端开发中的各类特殊场景如何通过前后端约定以减轻开发量。

## 批量插入数据

回忆上一节中我们对[批量插入数据](./crud.html#批量插入)的 sql 处理，其实是自动将数据转换为了批量插入的模式：

```sql
insert into tbl_sample_fake_type(prod_name,month_name,value ) values ?
```

在前台开发中，如何保证不做任何调整的情况下确保数据的顺利写入？

假设有这样的数据结构：

```sql
select uid,username,nickname,rec_date,gender,age from user_list;
```

其中 uid 为自增主键。如果我们想要一次性插入一组用户信息，只需通过以下的查询语句

```sql
select username,nickname,rec_date,gender,age from user_list
```

建立一个批量查询接口，系统将自动转换 sql 如下:

```sql
insert into user_list(username,nickname,rec_date,gender,age ) values ?
```

这时，调用代码将变为：

```js
/**
*   @database: { 接口管理 }
*   @desc:     { 批量接口测试 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{username,nickname,rec_date,gender,age }]，数组的每一项表示一条数据*/
export const addUserList = (values) =>
  axios({
    method: 'post',
    data: {
      values,
      id: 51,
      nonce: '65b5c14441'
    }
  });
```

前台调用如下：

```ts
import * as db from './db';

interface user {
  username: string;
  nickname: string;
  rec_date: string;
  gender: number;
  age: number;
}

interface createRes {
  data: Array<{
    affected_rows: number;
    id?: number;
  }>;
}

let submitData: () => void = async () => {
  let users: Array<user> = [
    {
      username: '张三',
      nickname: '张三丰',
      rec_date: '2019-01-01 02:03:04',
      gender: 0,
      age: 98
    },
    {
      username: '李四',
      nickname: '李四光',
      rec_date: '2019-01-02 02:03:04',
      gender: 0,
      age: 32
    }
  ];

  let {
    data: [{ affected_rows }]
  }: createRes = await db.addUserList(users);

  if (!affected_rows) {
    console.log('插入数据失败');
    return;
  }
  // 后续逻辑
};
```

## 防止 SQL 注入

::: danger SQL 注入
在数据写入/修改中，由于是拼接字符串，会存在 SQL 注入的风险。
:::
例如，开发者想更新这样的信息：

```sql
update tblSample set status = 3 where user_type = 'guest'
```

但如果接口调用者在传参数时，如果参数 user_type = "guest' or 1 = 1 or '1 = 1",后台拼接结果将变为：

```sql
update tblSample set status = 3 where user_type = 'guest' or 1 = 1 or '1 = 1';
```

此时更新会将所有数据更新。为此，如果在前台提交危险的字符，后端将会强制转义，以上场景将被转换为：

```sql
update tblSample set status = 3 where user_type = 'guest\' or 1 = 1 or \'1 = 1';
```

处理后， 数据更新将失败。
::: tip
经过以上的处理，在内网中的安全能够得到保障。
:::

## 系统保留参数

我们注意到，系统将自动以 id 以及 nonce 作为保留参数调用接口，除此之外还有以下接口用在各类场景中：

- id: 接口 id
- nonce: 接口校验码
- callback: jsonp 跨域回调参数的名称
- cache: 接口的后端缓存时长，单位：分钟
- api_auth_id: api 作者 id，当有多个用户同时需要使用接口管理时，将为每人分配唯一的 api_id
- mode: 数据模式，支持 array 和 object，默认为 object,当设为 array 时，返回的 data 字段子项为数组
- data_type: xml/json，默认为 json,设为 xml 时将输出 xml，此时跨域的限制将失效
- blob: 指定哪个字段是二进制数据，可以指定为多个，如 _blob[]=ErrImage1&blob[]=ErrImage2&blob[]=ErrImage3_
- blob*type: 指定二进制字段的数据类型，自动在前面补上 base64 描述信息，可传字段如：jpg,png,bmp 等，如 *&blob[]=ErrImage1&blob[]=ErrImage2&blob[]=ErrImage3&date*type=jpg*,其输出将自动在 base64 数据前补上前缀。

## 数据请求方式

大多数时候，默认参数无需使用，系统直接支持下列场景：

> 默认参数，cache[缓存]0,mode[数据格式]json：
>
> http://localhost:90/api/?id=51&nonce=65b5c14441&cache=0&mode=json&data_type=json

### 1. 使用 json 后缀，5 分钟缓存

> http://localhost:90/api/51/65b5c14441.json?cache=5

### 2. 5 分钟缓存，更换后缀，以数组结构输出数据

url 第三段为数值时表示缓存，默认 json，需要返回数组时加 mode 参数

> http://localhost:90/api/51/65b5c14441/5.html?mode=array
>
> http://localhost:90/api/51/65b5c14441/5.html

### 3. 不带后缀默认 json 输出

url 后缀表示数据类型:设为 xml 时以 xml 返回，否则以 json 返回，设为 array 时 json 数据项将转换为数组而非对象。后缀也可设为.html,.jpg，默认以 json 的形式输出：

> http://localhost:90/api/51/65b5c14441

### 4. json 后缀

> http://localhost:90/api/51/65b5c14441.json

### 5. 以数组形式输出

> http://localhost:90/api/51/65b5c14441.array

### 6. 输出 xml

> http://localhost:90/api/51/65b5c14441.xml

### 7. 其它任意形式的后缀

> http://localhost:90/api/51/65b5c14441.html
>
> http://localhost:90/api/51/65b5c14441.jpg
>
> http://localhost:90/api/51/65b5c14441/5.xml

## 总结

当熟悉系列中的各项约定时，大多数的开发场景都能满足了，接下来是我们在使用中总结出的各种场景的最佳实践。
