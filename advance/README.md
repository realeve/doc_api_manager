# 系统部署

在进阶手册中，我们将对系统部署，后台二次开发与配置等环节做详细说明，后面将以 10.8.1.25 这一服务器 IP 为例说明，用户自行更换为个人接口。

## 准备 php 环境

下载　[wamp](http://www.onlinedown.net/soft/118187.htm) 运行环境，确保 php 环境搭建正常，详情可以[参考这里](https://www.cnblogs.com/Informal/p/5608871.html)。[php](http://php.net/downloads.php) 建议升级至 7.0 以上以获得更好的性能。

## php 数据库环境

确保 php 当前配置能连接上 MySQL/SQL Server/Oracle 数据库，相关教程自行搜索。

## 部署数据库

系统默认需要 mysql 支持，手工导入运行软件包中提供的数据库初始化语句。

## 部署应用

### 1.部署后端

将后台打包部署至服务器，假设端口号为 80。在浏览器打开[接口管理主页](http://10.8.1.25/public)确保能正常访问。

:::tip 使用其它 IP
如果使用其它端口则链接也一同更改，如：http://10.8.1.25:8000/public
:::

### 2.配置前台

定位至应用目录 public/js/common/public.js 文件，目录结构如下
::: vue
├─`public`_(**目录**)_
│ ├─cdn
│ ├─css
│ ├─img
│ ├─`js`_(**目录**)_
│ │ ├─`common`_(**目录**)_
│ │ │ ├─demo.js
│ │ │ ├─layout.js
│ │ │ ├─`public.js`_(**文件**)_
│ │ │ ├─quick-nav.js
│ │ │ └─quick-sidebar.js
│ │ ├─page
│ │ │ ├─common
│ │ │ ├─index
│ │ │ ├─login
│ │ │ └─setting
│ │ └─plugins
:::

将其中的 _http://localhost:90_ 更换为你部署的服务，如 _http://10.8.1.25:8000_

::: tip 输出目录树
在 cmd 中的 tree 命令支持输出目录树，相关用法如下：

TREE [drive:][path] [/F][/a]

/F Display the names of the files in each folder.

/A Use ASCII instead of extended characters.
:::

### 3.前台登录

进入链接 [http://10.8.1.25:8000/public](http://10.8.1.25:8000/public)输入用户名密码，如果登录成功，说明应用环境部署成功。
