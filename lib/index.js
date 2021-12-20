const { default: axios } = require("axios");
const { existsSync } = require("fs");
const inquirer = require("inquirer");
const ora = require("ora");
const path = require("path");
const { render } = require("consolidate").handlebars;
//通过node.js提供promisify()将download-git-repo提供的方法转换为Promise
const { promisify } = require("util");
const download = promisify(require("download-git-repo"));
const Metalsmith = require("metalsmith");
const ncp = require("ncp");

/**
 * 为一个promise函数添加一个loading
 * @param {*} callback 返回Promise且需要被loading修饰的函数
 * @returns 被修饰的方法
 */
const loading = (callback) => {
  return async (...args) => {
    let spinner = ora("start...").start();
    try {
      //没有异常即成功
      let res = await callback(...args);
      spinner.succeed("success");
      return res;
    } catch (error) {
      spinner.fail("fail");
      return error;
    }
  };
};

/**
 * 获取仓库列表
 * @param {string} username 被获取的用户名
 * @returns {Array} 仓库列表
 */
const fetchRepoList = async (username) => {
  let { data } = await axios.get(`https://api.github.com/users/${username}/repos`);
  return data.map((item) => item.name);
};

/**
 * 获取仓库branches列表
 * @param {string} username 被获取的用户名
 *  * @param {string} repoName 被获取的仓库名称
 * @returns {Array} 仓库列表
 */
const fetchTagList = async (username, repoName) => {
  let { data } = await axios.get(`https://api.github.com/repos/${username}/${repoName}/branches`);
  return data.map((item) => item.name);
};

const downloadGithub = async (username, repoName) => {
  const cacheDir = `${process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]}/.tmp`;
  //拼接一个下载后的目录
  let dest = path.join(cacheDir, repoName);
  console.log(dest, 9999);
  // fs模块提供的existsSync 方法用于判断目录是否存在，如果存在，说明无需下载
  let flag = existsSync(dest);
  let url = `${username}/${repoName}`;
  if (!flag) {
    await loading(download)(url, dest);
  }
  return dest;
};

module.exports = async (name) => {
  let { projectName } = await inquirer.prompt({
    // 问题的类型，input 表示输入
    type: "input",
    //答案的key
    name: "projectName",
    //问题
    message: "The project name is it?",
    // 默认值
    default: name,
  });
  //获取仓库地址
  let repos = await loading(fetchRepoList)("mocaii");
  let { repoName } = await inquirer.prompt({
    type: "list",
    name: "repoName",
    message: "Choose a template",
    choices: repos,
  });

  //获取所有分支
  let branches = await loading(fetchTagList)("mocaii", repoName);

  //如果有多个分支，用户进入选择，没有多个就直接下载
  if (branches.length > 1) {
    let { checkout } = await inquirer.prompt({
      type: "list",
      name: "checkout",
      message: "Choose the target branch",
      choices: branches,
    });
    repoName += `#${checkout}`;
  } else {
    repoName += `#${branches[0]}`;
  }

  //下载模版到临时目录
  let dest = await downloadGithub("mocaii", repoName);

  //判断下载的模版是否包含question.js 如果包含则进行模版的替换，否则直接复制到目标仓库
  if (existsSync(path.join(dest, "question.js"))) {
    await new Promise((resolve, reject) => {
      //静态站点生成器
      Metalsmith(__dirname)
        //源目录 默认值 src
        .source(dest)
        //目标目录 默认值 build
        .destination(path.resolve(projectName))
        //中间处理方法
        .use(async (files, metal, done) => {
          //files 需要渲染的模板目录下的所有类型的文件
          //metal.metadata() 可以用来保存所有的数据，交给下一个use使用
          //done() 执行完毕调用

          //加载question文件
          const quesList = require(path.join(dest, "question.js"));
          //依据问题数据，定义交互问题
          let answers = await inquirer.prompt(quesList);

          //当前 answers 保存的是用户传递的数据，通过metal.metadata()将其保存给下一个use中使用
          let meta = metal.metadata();
          Object.assign(meta, answers, { projectName });

          //删除question.js文件，避免拷贝的用户模版
          //可以通过delete关键字删除的原因是因为files中存在的全部都是buffer
          delete files["question.js"];
          done();
        })
        .use((files, metal, done) => {
          //获取上一个use中存储的数据
          let data = metal.metadata();

          //将files中所有自有属性制作为一个数据
          let arr = Reflect.ownKeys(files);
          //通过遍历数组，将所有的buffer转换成字符串，然后通过模版引擎进行替换，最后转换为buffer存储即可
          arr.forEach(async (file) => {
            //只对js或者json文件进行替换
            if (file.includes("js") || file.includes("json")) {
              let content = files[file].contents.toString();
              //如果包含模版引擎语法就进行替换
              if (content.includes("{{")) {
                content = await render(content, data);
                files[file].contents = Buffer.from(content);
              }
            }
          });
          done();
        })
        // 如果有异常 Promise 调用reject
        .build((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
    console.log("\nsuccess~");
  } else {
    //如果不需要模版进行处理的直接拷贝至项目目录
    ncp(dest, projectName);
  }
};
