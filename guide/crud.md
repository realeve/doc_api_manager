# 增删改查

以上一节的 demo 为例，我们准备这样一段查询语句，看看在新增接口的界面中，分别点击插入、批量插入、删除、更新、查询后，前台将自动对 SQL 做怎样的转换？

```sql
SELECT
	a.prod_name,
	a.month_name,
	a.value
FROM
	tbl_sample_fake_type AS a
WHERE
	type = '褶子'
```

## 插入

```sql
insert into tbl_sample_fake_type(prod_name,month_name,value ) values (?,?,?)
```

### 调用代码

```js
/**
*   @database: { 接口管理 }
*   @desc:     { 接口测试 } 
    const { prod_name, month_name, value } = params;
*/
export const addSampleFakeType = (params) =>
  axios({
    url: '/51/65b5c14441.json',
    params
  });
```

> 调用代码中的前缀变为 add

### 调用成功后的返回数据

调用成功后，返回数据的 affected_rows 为 1，id 字段为最近插入数据的 id

```json
{
  "data": [
    {
      "affected_rows": 1,
      "id": 2
    }
  ]
}
```

## 批量插入

```sql
insert into tbl_sample_fake_type(prod_name,month_name,value ) values ?
```

### 调用代码

```js
/**
*   @database: { 接口管理 }
*   @desc:     { 批量接口测试 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{prod_name,month_name,value }]，数组的每一项表示一条数据*/
export const addSampleFakeType = (values) =>
  axios({
    method: 'post',
    data: {
      values,
      id: 51,
      nonce: '65b5c14441'
    }
  });
```

> 调用代码中的前缀变为 add

### 调用成功后的返回数据

调用成功后，返回数据的 affected_rows 为插入的数据条数

```json
{
  "data": [
    {
      "affected_rows": 10
    }
  ]
}
```

## 删除

```sql
delete from tbl_sample_fake_type where type=?
```

### 调用代码

```js
 *   @database: { 接口管理 }
 *   @desc:     { 接口测试 }
 */
export const delSampleFakeType = type => axios({
  url: '/51/65b5c14441.json',
  params: {
    type
  },
});
```

> 调用代码中的前缀变为 del

### 调用成功后的返回数据

调用成功后，返回数据的 affected_rows 为删除的数据条数

```json
{
  "data": [
    {
      "affected_rows": 10
    }
  ]
}
```

::: danger
在删除数据时，建议使用 id 字段作为参数，另外为了安全性，可以再加入另一校验字段防止误删除，如下所示 ：
:::

```sql
SELECT
	a.prod_name,
	a.month_name,
	a.value
FROM
	tbl_sample_fake_type AS a
WHERE id = 11 and a.prod_name='some prod'
```

## 更新

```sql
update tbl_sample_fake_type set prod_name = ?,month_name = ?,value = ? where type=?
```

### 调用代码

```js
/**
*   @database: { 接口管理 }
*   @desc:     { 接口测试 } 
    const { prod_name, month_name, value, type } = params;
*/
export const setSampleFakeType = (params) =>
  axios({
    url: '/51/65b5c14441.json',
    params
  });
```

> 调用代码中的前缀变为 set

### 调用成功后的返回数据

调用成功后，返回数据的 affected_rows 为删除的数据条数

```json
{
  "data": [
    {
      "affected_rows": 10
    }
  ]
}
```

## 查询

```sql
select a.prod_name,a.month_name,a.type,a.value from tbl_sample_fake_type as a where type=?
```

### 调用代码

```js
/**
 *   @database: { 接口管理 }
 *   @desc:     { 接口测试 }
 */
export const getSampleFakeType = (type) =>
  axios({
    url: '/51/65b5c14441.json',
    params: {
      type
    }
  });
```

> 调用代码中的前缀变为 get

### 调用成功后的返回数据

返回数据见上一节的[接口输出字段说明](./new.html#接口输出字段说明)。

## 设计说明

在前面涉及数据更新的操作(插入、更新、删除)中，返回数据都输出了 affected_rows 字段表示影响的行数，如果是插入单条数据则同时返回 id 字段，这也与前台开发的使用场景保持一致，如有以下开发场景：

1. 更新/删除后，前台通知提示数据是否成功变更：

```js
const sample = async () => {
  let {
    data: [{ affected_rows }]
  } = await db.setTblSample({ type: 3, id: 5 });
  if (!affected_rows) {
    console.log('更新失败');
    return;
  }
};
```

2. 插入数据后获取最近插入数据的 id，同时与新添加的数据一起加入到新列表中:

```js
let list = [{ id: 2, type: 2, name: 'test2' }];

const sample = async () => {
  let param = {
    type: 3,
    name: 'test'
  };

  let {
    data: [{ affected_rows, id }]
  } = await db.addTblSample(param);

  if (!affected_rows) {
    console.log('更新失败');
    return;
  }

  list.push(Object.assign(param, { id }));
  // 其它逻辑
};
```

3. 此处的参数均被替换为问号，用户可根据需要自行编写查询代码同时手工添加参数，如：

无参数的场景，系统支持直接预览返回数据

```sql
 SELECT
	a.prod_name,
	a.month_name,
	a.value
FROM
	tbl_sample_fake_type AS a
```

自定义参数的场景

```sql
 SELECT
	a.prod_name,
	a.value
FROM
	tbl_sample_fake_type a where a.month_name=?
```

至此，我们已经对系统在数据 CRUD 层有了基本了解，并且已经可以自行设计满足基本功能要求的接口了。

::: warning Restful
在功能设计中，我们保留了 restful 的数据操作方式，但在实际使用中发现其便捷性不如本小节中所讲述的方式，故在此不做展开，有需要的可自行查阅源码。
:::
