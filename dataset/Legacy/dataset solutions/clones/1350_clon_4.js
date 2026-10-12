const fileSystemAccess = require("fs");
const sourceData = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
const initialSegment = (sourceData.match(/^.*?(?=\n|$)/) || [''])[0];
const numericalBase = Number(initialSegment);
const finalProduct = Math.pow(numericalBase, 3);
console.log(finalProduct + "\n");
