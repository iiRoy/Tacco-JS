const fileSystemModule = require("fs");
const inputSourcePath = "/dev/stdin";
const textEncoding = "utf8";

const rawContent = fileSystemModule.readFileSync(inputSourcePath, textEncoding);
const numericalInput = +rawContent;
const resultValue = numericalInput ** 3;

console.log(resultValue);
