"use strict";
const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenArray = sourceData.split(/ |\n/);
let tokenIndex = 0;

function obtainNextNumber() {
  return +tokenArray[tokenIndex++];
}

const outputBuffer = [];
function appendToOutput(content) {
  outputBuffer.push(content);
}

const primeModulus = 1000000007;

function computeModularProduct(...factors) {
  let currentProduct = 1n;
  const modulusBigInt = BigInt(primeModulus);
  for (const factor of factors) {
    currentProduct = (currentProduct * BigInt(factor)) % modulusBigInt;
  }
  return Number(currentProduct);
}

function computeModularPower(base, exponent) {
  if (exponent === 0) return 1;
  if (exponent === 1) return base % primeModulus;
  
  let halfPowerResult = computeModularPower(computeModularProduct(base, base), Math.floor(exponent / 2));
  
  if (exponent % 2 === 1) {
    return computeModularProduct(halfPowerResult, base);
  } else {
    return halfPowerResult;
  }
}

function normalizeModulo(value) {
  return (value % primeModulus + primeModulus) % primeModulus;
}

function executeCoreLogic() {
  const currentN = obtainNextNumber();
  const basesForCalculation = [10, 9, 8];
  const coefficientsForCalculation = [1, -2, 1];

  let cumulativeSum = 0;

  for (let i = 0; i < basesForCalculation.length; i++) {
    const baseValue = basesForCalculation[i];
    const coefficientValue = coefficientsForCalculation[i];

    const termPower = computeModularPower(baseValue, currentN);

    let termContribution;
    if (coefficientValue === 1) {
      termContribution = termPower;
    } else if (coefficientValue === -2) {
      termContribution = normalizeModulo(0 - computeModularProduct(2, termPower));
    } else {
      termContribution = computeModularProduct(coefficientValue, termPower);
    }
    
    cumulativeSum = normalizeModulo(cumulativeSum + termContribution);
  }
  return cumulativeSum;
}

const finalResult = executeCoreLogic();
if (finalResult !== undefined) console.log(String(finalResult));
if (outputBuffer.length) console.log(outputBuffer.join("\n"));
