const fileSystemModule = require("fs");

const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

const rawInputBuffer = fileSystemModule.readFileSync(standardInputPath, textEncoding);

const transformedOutputString = rawInputBuffer.toUpperCase();

console.log(transformedOutputString);
