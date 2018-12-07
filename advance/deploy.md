# 系统部署

在进阶手册中，我们将对系统部署，后台二次开发与配置等环节做详细说明，后面将以 10.8.1.25 这一服务器 IP 为例说明，用户自行更换为个人接口。

## 准备 php 环境

下载　[wamp](http://www.onlinedown.net/soft/118187.htm) 运行环境，确保 php 环境搭建正常，详情可以[参考这里](https://www.cnblogs.com/Informal/p/5608871.html)。[php](http://php.net/downloads.php) 建议升级至 7.0 以上以获得更好的性能。

## php 数据库环境

确保 php 当前配置能连接上 MySQL/SQL Server/Oracle 数据库，相关教程自行搜索。

## 部署数据库

系统默认需要 mysql 支持，手工导入运行软件包中提供的数据库初始化语句。

## 部署应用

将后台打包部署至服务器，假设端口号为 80，在浏览器打开[接口管理主页](http://10.8.1.25/public)确保能正常访问。

:::tip 使用其它 IP
如果使用其它端口则链接也一同更改，如：http://10.8.1.25:8000/public
:::