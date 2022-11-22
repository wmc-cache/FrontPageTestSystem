const path = require("path");
const glob = require("glob");
const { spawn } = require("child_process");
const fs = require('fs-extra');
const chalk = require('chalk');
const handlebars = require('handlebars');

const varCase = (str) =>
  str
    .replace(/-[a-z]/g, (m) => m[1].toUpperCase())
    .replace(/^.{1}/, (m) => m.toUpperCase());
const lowCase = (str) =>
  str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).replace(/^-/, "");

function add() {
  const component = process.argv[2];
  const dirName = lowCase(component);
  const componentName = varCase(component);
  

  spawn("mkdir", ["-p", path.join(process.cwd(), `src/components/${componentName}`)]);
  const tplFiles = glob.sync(path.join(__dirname, "template/*.hbs"));
  
  tplFiles.forEach(async (filePath) => {
    const content = await fs.readFile(filePath, "utf-8");
    const tempalte = handlebars.compile(content);
    const result = tempalte({
      dirName,
      componentName,
    });
    const newPath = filePath
      .replace("script/template", `src/components/${componentName}`)
      .replace("template", dirName)
      .replace(".hbs", "");
    
    await fs.writeFile(newPath, result);
    console.log(chalk.blue(`新建 ${newPath} 成功`));
  });
}
add();
