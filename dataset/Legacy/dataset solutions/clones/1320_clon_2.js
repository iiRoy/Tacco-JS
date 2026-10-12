let inputData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');

let concatenatedString = inputData[0] + inputData[0];

let searchPattern = inputData[1];

console.log(concatenatedString.indexOf(searchPattern) !== -1 ? 'Yes' : 'No');
