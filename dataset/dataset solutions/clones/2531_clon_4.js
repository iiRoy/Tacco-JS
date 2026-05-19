"use strict"

// Helper function to determine if a number is prime
function checkPrimality(numVal) {
  if (numVal < 2) return false;
  if (numVal === 2) return true;
  if (numVal % 2 === 0) return false;

  for (let k = 3; k * k <= numVal; k += 2) {
    if (numVal % k === 0) return false;
  }
  return true;
}

// Function to generate a list of prime numbers up to a given limit
function generatePrimes(limitVal) {
  const primeList = [];
  for (let m = 2; m <= limitVal; m++) {
    if (checkPrimality(m)) {
      primeList.push(m);
    }
  }
  return primeList;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const inputTokens = rawInputData.split(' ');

const firstOperand = parseInt(inputTokens[0]);
const secondOperand = parseInt(inputTokens[1]);

const maxHalfValue = Math.ceil(Math.max(firstOperand, secondOperand) / 2);

const potentialDivisors = generatePrimes(maxHalfValue);

potentialDivisors.push(1);

const matchingFactors = potentialDivisors.reduce((accumulator, currentDivisor) => {
  if (firstOperand % currentDivisor === 0 && secondOperand % currentDivisor === 0) {
    accumulator.push(currentDivisor);
  }
  return accumulator;
}, []);

if (matchingFactors.length === 1 && firstOperand === secondOperand) {
  matchingFactors.push(firstOperand);
}

console.log(matchingFactors.length);
