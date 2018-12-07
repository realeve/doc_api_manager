# 服务器白名单

::: danger 第三方直接调用
如果第三方系统需要直接调用数据接口，需联系管理员将对应域名添加至白名单，否则服务器将拒绝访问，返回 401 错误。
:::

## 文件路径

打开应用目录下 _application/config.php_,目录结构如下：
::: vue
`thinkPHP`
├─.vscode
├─`application`
│ ├─command.php
│ ├─common.php
│ ├─`config.php`
│ ├─database.php
│ ├─route.php
│ ├─tags.php
│ ├─api
│ │ ├─config.php
│ │ ├─database.php
│ │ ├─controller
│ │ ├─sql
│ │ └─view
│ │ └─index
│ ├─extra
│ ├─index
│ │ ├─controller
│ │ └─view
│ │ └─index
├─extend
:::

文件底部，allow_origin 项内容如下：

```php
'allow_origin' => ['10.8.1.25','10.8.1.25:8000', 'localhost:8000', 'localhost:90']
```

数组中的配置项表示允许哪个网址访问服务器数据，此处不需要配置协议，需要指定端口号。即**同一台服务器，如果端口号不同，系统也不允许访问数据**。

## 跨域

当请求的数据服务器与前台页面地址主机信息不一致时，浏览器会因为安全限制直接拒绝请求。

::: tip 跨域
常见的跨域方案有 jsonp 及 cors 两种模式，系统默认两种方式都支持，但需要配置 cors 配置项。当发现请求的域与白名单中的域一致时，系统将在返回头中加入

Access-Control-Allow-Credentials: true

Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE

Access-Control-Allow-Origin:

分别表示为允许请求头校验、允许方法、允许域名
:::
