const inputFilePath = "/dev/stdin";

const fileContentRaw = require("fs").readFileSync(inputFilePath, "utf8");

const stringLines = fileContentRaw.split("\n");

const convertToNumber = (str) => Number(str);

const numericData = stringLines.map(convertToNumber);

let firstValue = numericData[0];
let secondValue = numericData[1];
let thirdValue = numericData[2];
let fourthValue = numericData[3];

const minOfFirstPair = Math.min(firstValue, secondValue);
const minOfSecondPair = Math.min(thirdValue, fourthValue);

const totalSumResult = minOfFirstPair + minOfSecondPair;

console.log(totalSumResult);
