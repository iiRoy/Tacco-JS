const fileSystem = require("fs");
const inputFilePath = "/dev/stdin";

const rawBuffer = fileSystem.readFileSync(inputFilePath, "utf8");
const processedString = rawBuffer.slice(0, -1);
const targetString = processedString.split('\n')[0];

let accumulatedSumOfDigits = 0;
const DIVISOR_FOR_CHECK = 9;

const characterArray = Array.from(targetString);

accumulatedSumOfDigits = characterArray.reduce((currentTotal, charElement) => {
  const digitValue = Number(charElement);
  return currentTotal + digitValue;
}, 0);

const resultCondition = (accumulatedSumOfDigits % DIVISOR_FOR_CHECK === 0);

console.log(resultCondition ? "Yes" : "No");
