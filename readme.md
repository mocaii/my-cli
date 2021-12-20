## 目录结构

- ├── node_modules # 项目依赖资源
- ├── bin # 脚手架入口。
- │ └── entry.js # 入口文件。
- ├── lib # 项目的主要逻辑代码
- │ └── index.js # 逻辑处理的 js 文件
- ├── .gitignore # Git 推送忽略列表配置文件
- ├── .prettierrc # Prettier 格式化配置文件
- └── package.json # 项目所需要的各种模块，以及项目的配置信息

## 插件介绍

### commander

node.js 命令行解决方案，简单直接的命令行工具开发组件

### axios

请求库，拉取数据

### ora

实现 loading 效果,terminal spinner

### inquirer

通用交互式命令行用户界面的集合，提供了一个漂亮的界面和提出问题流的方式

### chalk

实现彩色终端字体，终端样式库

### download-git-repo

基于 node 下载并提取 Git 仓库

### metalsmith

一个非常简单，可以插入的 static 站点生成器，静态网站生成器

### ncp

用于 copy 文件

### consolidate

模板引擎的集合

### handlebars

模板引擎，轻量的语义化模板

## 知识要点

### 1.npm link

将命令链接到全局，执行命令是要在项目根目录，npm unlink 取消链接

### 2.process.argv 属性

一个数组，包含当启动 node.js 进程是传入的命令行参数

- 第一个元素是 process.execPath，node.js 的安装路径
- 第二元素是正在执行的 js 文件路基 ing
- 其余是其他命令行参数

```js
my-cli create node

[ '/usr/local/bin/node', '/usr/local/bin/my-cli', 'create', 'node' ]
```

### 3.commander 的使用

```
program.version(version).parse();

//命令行输入，查看版本号
my-cli -V;
```

### 4.Github Api

- 获取指定用户的仓库列表

```js
`https://api.github.com/users/${username}/repos`;
```

- 获取指定仓库的分支列表

```js
`https://api.github.com/repos/${username}/${repositoriesName}/branches`;
```
