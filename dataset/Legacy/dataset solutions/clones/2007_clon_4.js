const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const dataRows = fileContent.split('\n');
const [firstVal, secondVal] = dataRows[0].split(' ').map(Number);

console.log(firstVal, secondVal);

const lowerMultiple = Math.floor(firstVal / secondVal) * secondVal;
const upperMultiple = Math.ceil(firstVal / secondVal) * secondVal;

const distToLower = firstVal - lowerMultiple;
const distToUpper = upperMultiple - firstVal;

const finalOutcome = distToLower < distToUpper ? distToLower : distToUpper;
console.log(finalOutcome);
