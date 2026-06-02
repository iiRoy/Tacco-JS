'use strict';

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

let rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
let processedString = rawInputContent.trim();

const akihabaraPattern = /^A?KIHA?BA?RA?/;

let isMatchFound = akihabaraPattern.test(processedString);

let finalOutputMessage;
if (isMatchFound) {
    finalOutputMessage = "YES";
} else {
    finalOutputMessage = "NO";
}

console.log(finalOutputMessage);
