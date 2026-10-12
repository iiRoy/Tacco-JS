var fileSystem = require("fs");
var unusedInput = fileSystem.readFileSync("/dev/stdin","utf8");

const initialPrincipal = 100000;
const unusedRateValue = 5;
const iterationCount = 5;

const calculateAdjustedBalance = (currentBalance, remainingIterations) => {
  if (remainingIterations === 0) {
    return currentBalance;
  }

  const growthFactor = 1.05; 
  const compoundedAmount = currentBalance * growthFactor;
  const roundedUpAmount = Math.ceil(compoundedAmount / 1000) * 1000;

  return calculateAdjustedBalance(roundedUpAmount, remainingIterations - 1);
};

console.log(calculateAdjustedBalance(initialPrincipal, iterationCount));
