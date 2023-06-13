const chalk = require("chalk");
const path = require("path");
const util = require("util");
const downloadgitrepo = require("download-git-repo");
const inquirer = require("inquirer");
const axios = require("axios");
const question = require("./question");
// console.log(question);
// 加载中
const ora = require("ora");
// 文件处理
const fs = require("fs-extra");
module.exports = async function (projectName, option) {
  //  创建项目
  //  命名重复
  let { name, description } = await inquirer.prompt(question);
  if (name !== projectName) projectName = name;
  // 1. 获取当前执行目录
  const cwd = process.cwd();
  const targetDir = path.join(cwd, projectName);
  if (fs.existsSync(targetDir)) {
    if (option.force) {
      // 强制创建,加入 -f 命令后如果文件存在重名会强制移除上一个文件，新建一个文件
      await fs.remove(targetDir);
    } else {
      // 这个是用户没有加入 -f强制命令进行是否覆盖处理 提示用户是否确定要覆盖,用户选项提示
      let { action } = await inquirer.prompt([
        {
          name: "action",
          type: "list",
          massage: "当前文件名重复是否覆盖?",
          validate(val) {
            if (val === "") {
              return "Name is required!";
            } else {
              return true;
            }
          },
          choices: [
            { name: "覆盖", value: "overwrite" },
            { name: "取消", value: false },
          ],
        },
      ]);
      // 如果用户不覆盖，直接取消
      if (!action) {
        console.log(`\r\n 取消构建`);
        return;
      } else if (action == "overwrite") {
        // 如果要覆盖直接将之前文件进行移除 然后覆盖
        console.log(`\r\n 正在移除...`);
        await fs.remove(targetDir);
      }
    }
  }
  // fetchRepo，fetchTag俩个方法写在下面
  //选择版本号
  async function fetchTag() {
    let { tag } = await inquirer.prompt({
      name: "tag",
      type: "list",
      choices: ["default"],
      message: "请选择版本号!",
    });
    if (tag === "default") return "";
    return tag;
  }

  //获取远程模板
  /**
   * @description: 获取仓库列表
   * @param {string} username 被获取的用户名
   * @returns {Array} 仓库列表
   */
  const fetchRepoList = async (username) => {
    let { data } = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );
    return data.map((item) => item.name);
  };

  //选择模板
  async function fetchRepo(username) {
    //获取远程仓库的模板供选择
    let template = await fetchRepoList(username);
    let { tag } = await inquirer.prompt({
      name: "tag",
      type: "list",
      choices: template,
      message: "请选择模板!",
    });
    return tag;
  }

  //拉取远程仓库代码
  const downloadGitRepofn = util.promisify(downloadgitrepo);
  // 在这里写入你的git仓库地址
  // 注意：需要使用github,或者是gitlab的地址"https://github.com/szmsxm/create-vite_react"
  const gitbseurl = "szmsxm";
  async function downloadtemp(temp, tag) {
    //  1. 拼接下载路径
    let requestUrl = `${gitbseurl}/${temp}/${tag ? "#" + tag : ""}`;
    //  2. 把资源下载到某个路径上，（后续增加缓存功能）
    let target = await downloadGitRepofn(
      requestUrl,
      path.resolve(process.cwd(), `${projectName}${tag ? "@" + tag : ""}`)
    );
    return target;
  }

  let Temp = await fetchRepo("szmsxm");
  let tag = await fetchTag();
  const spinner = ora("开始加载...").start();
  let result = await downloadtemp(Temp, tag);
  spinner.succeed(`${chalk.green("加载完毕")}`);
  console.log(`\r\n ${chalk.blue("创建成功！")}`, ":::", result);
};
