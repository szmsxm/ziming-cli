// 自定义交互式命令行的问题及简单的校验
let question = [
  {
    name: "name",
    type: "input",
    message: "Please enter the project name! ",
    validate(val) {
      if (val === "") {
        return "Name is required!";
      } else {
        return true;
      }
    },
  },
  {
    name: "description",
    type: "input",
    message: "Project description",
  },
];
module.exports = question;
