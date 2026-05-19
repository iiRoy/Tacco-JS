"use strict";
const fileSystemModule = require("fs");
const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
const processedString = rawInputBuffer.trim();
const numericValue = Number(processedString);

let outputDecision;

switch (numericValue) {
    case 3:
        outputDecision = "YES";
        break;
    case 5:
        outputDecision = "YES";
        break;
    case 7:
        outputDecision = "YES";
        break;
    default:
        outputDecision = "NO";
        break;
}

console.log(outputDecision);
