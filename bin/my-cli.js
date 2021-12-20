#! /usr/bin/env node
// 告诉系统可以在PATH目录中查找，然后使用Node运行
// console.log(process.argv)
const { program } = require("commander");
const { version } = require("../package.json");
// require("..") 表示上级目录中呢的index.js
const createProject = require("..");

program
  //定义命令
  .command("create")
  //设置别名
  .alias("crt")
  //定义参数
  .argument("<projectName>")
  //定义命令处理方法
  .action((projectName) => {
    //该方法接收一个回调函数，回调函数的参数名称就是前面定义的参数

    //定义在外部的处理函数
    createProject(projectName);
  });

// .version() 方法用于设置版本号，当在命令行中执行 --version 或着 -V时，显示的版本
// .parse() 用于解析命令行参数，默认值为process.argv
program.version(version).parse();
