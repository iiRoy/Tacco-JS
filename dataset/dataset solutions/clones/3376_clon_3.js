"use strict";

function _destructureArray(arr, i) { return _checkArrayType(arr) || _extractLimitedIterable(arr, i) || _throwNonIterableError(); }

function _throwNonIterableError() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _extractLimitedIterable(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _checkArrayType(arr) { if (Array.isArray(arr)) return arr; }

// Helper function to manage the special case where the exponent is 1.
const handleNIsOneCase = (currentExponent, currentValue) => {
  if (currentExponent === 1) {
    console.log(currentValue);
    return true; // Indicates the special case was handled.
  }
  return false; // Indicates normal processing should continue.
};

// Helper function to determine if a dividend is perfectly divisible by a base raised to a given power.
const isDivisibleByPower = (dividend, base, power) => {
  const calculatedPowerValue = Math.pow(base, power);
  return dividend % calculatedPowerValue === 0;
};

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const parsedNumbers = parseNumbersFromString(inputLines[0]);
  const destructuredNums = _destructureArray(parsedNumbers, 2);
  const exponentVal = destructuredNums[0];
  const baseVal = destructuredNums[1];

  // Apply the guard clause for the N=1 special condition.
  if (handleNIsOneCase(exponentVal, baseVal)) {
    return;
  }

  // Calculate the upper bound for our search loop.
  const rootPowerFraction = 1 / exponentVal;
  const calculatedUpperBound = Math.pow(baseVal, rootPowerFraction);

  let resultFactor = 1; // Initialize the factor that satisfies the condition.

  // Iterate through potential factors starting from 2 up to the calculated upper bound.
  for (let currentCandidateFactor = 2; currentCandidateFactor <= calculatedUpperBound; currentCandidateFactor++) {
    // Use the helper function to check for divisibility.
    if (isDivisibleByPower(baseVal, currentCandidateFactor, exponentVal)) {
      resultFactor = currentCandidateFactor; // Update the result if a larger factor is found.
    }
  }

  console.log(resultFactor);
}

function greatestCommonDivisor(numA, numB) {
  if (numA < numB) return greatestCommonDivisor(numB, numA);
  if (numB === 0) return numA;
  const remainderVal = numA % numB;
  return greatestCommonDivisor(numB, remainderVal);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbersFromString(inputLineStr) {
  // Split the string by whitespace and convert each part to an integer with radix 10.
  return inputLineStr.split(/\s+/).map(numStr => parseInt(numStr, 10));
}
