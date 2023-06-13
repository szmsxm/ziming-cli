#! /usr/bin/env node

console.log("宋子明的脚手架");
const { program } = require("commander");
const chalk = require("chalk");
// const createFile = import("../lib/createFile");
const create = require("./create.js");

// 创建一个app项目
program
  .command(`create <app-name>`)
  .description(`create a new project`)
  .option(`-f,--force`, `overwrite target directory if it exists`)
  // 动作
  .action((name, cmd) => {
    // create 方法看下面的内容
    console.log(name, cmd);
    create(name, cmd);
  });

program.on("--help", () => {
  console.log("");
  console.log(`Run ${chalk.cyan(" sq <command> --help")} show details `);
  console.log("");
});

//未声明的命令：错误处理
program.on("command:*", ([result]) => {
  console.log();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(result)}.`));
  console.log();
  suggestCommands(result);
});

program.parse(process.argv);
// 后面根据自己的需求去自定义就可以了

//根据用户输入的错误命令进行解析，查看命令表中是否有相似的命令
function suggestCommands(unknownCommand) {
  const commands = program.commands.map((cmd) => cmd._name);
  let suggestion = "";

  commands.forEach((cmd) => {
    const m = unknownCommand.length;
    const n = cmd.length;
    const dp = new Array();
    for (let i = 0; i <= m; i++) {
      const temp = new Array();
      for (let j = 0; j <= n; j++) temp.push(0);
      dp.push(temp);
    }

    for (let i = 0; i <= m; ++i) dp[i][0] = i;

    for (let j = 0; j <= n; ++j) dp[0][j] = j;

    for (let i = 1; i <= m; ++i) {
      for (let j = 1; j <= n; ++j) {
        if (unknownCommand[i - 1] === cmd[j - 1]) {
          dp[i][j] =
            1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1] - 1);
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    if (dp[m][n] < 4) suggestion = cmd;
  });

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)} ?`));
  }
}
