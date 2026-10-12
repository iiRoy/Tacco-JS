const sourcePath = "/dev/stdin";
const rawInputContent = require("fs").readFileSync(sourcePath, "utf8");
const inputLines = rawInputContent.split('\n');

const firstLineData = inputLines[0];
const parsedNumbers = firstLineData.split(' ').map(Number);

const primaryValue = parsedNumbers[0];
const divisorValue = parsedNumbers[1];

console.log(primaryValue, divisorValue);

const initialRemainder = primaryValue % divisorValue;
let finalResult = initialRemainder;

const differenceFromDivisor = initialRemainder - divisorValue;
const absoluteDifference = Math.abs(differenceFromDivisor);

finalResult = Math.min(finalResult, absoluteDifference);
console.log(finalResult);
