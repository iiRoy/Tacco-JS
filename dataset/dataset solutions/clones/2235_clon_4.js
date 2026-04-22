const acquiredContent = require("fs").readFileSync("/dev/stdin", "utf8");

const numericalComponents = acquiredContent
  .split(/\s+/)
  .filter(Boolean)
  .map(individualComponent => Number(individualComponent));

const primaryDivisor = numericalComponents[0];
const dividendAmount = numericalComponents[2];

const determineCeilingDivision = (inputDividend, inputDivisor) => {
  if (inputDivisor === 0) {
    return 0; 
  }
  return Math.floor((inputDividend + inputDivisor - 1) / inputDivisor);
};

console.log(determineCeilingDivision(dividendAmount, primaryDivisor));