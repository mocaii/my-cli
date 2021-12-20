module.exports = [
  {
    type: "input",
    name: "version",
    message: "version?",
    default: "0.1.0",
  },
  {
    type: "input",
    name: "description",
    message: "description?",
  },
  {
    type: "input",
    name: "author",
    message: "author?",
  },
  {
    type: "input",
    name: "email",
    message: "email?",
  },
  {
    type: "input",
    name: "github",
    message: "github?",
  },
  {
    type: "list",
    name: "license",
    message: "Choose a license",
    choices: ["LGPL", "Mozilla", "GPL", "BSD", "MIT", "Apache"],
    default: "MIT",
  },
];
