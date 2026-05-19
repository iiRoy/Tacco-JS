var currentBalance = 100;
const interestMultiplier = 1.05;
const outputScalingFactor = 1000;

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var iterationCount = parseInt(fileContent.trim(), 10);

let periodIndex = 0;
while (periodIndex < iterationCount) {
  let nextBalanceCalculation = currentBalance * interestMultiplier;
  currentBalance = Math.ceil(nextBalanceCalculation);
  periodIndex++;
}

const finalOutputValue = currentBalance * outputScalingFactor;
console.log(finalOutputValue);
