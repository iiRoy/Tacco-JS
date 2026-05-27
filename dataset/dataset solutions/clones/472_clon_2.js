function computeGreatestCommonDivisor(firstNum, secondNum) {
  // Determine the larger and smaller of the two input numbers
  let maxVal = Math.max(firstNum, secondNum);
  let minVal = Math.min(firstNum, secondNum);

  // Use the Euclidean algorithm to find the GCD
  while (minVal !== 0) {
    // Store the current value of minVal before it's updated
    let tempMin = minVal;
    // Calculate the remainder of maxVal divided by minVal
    minVal = maxVal % minVal;
    // Update maxVal to the previous minVal
    maxVal = tempMin;
  }
  // When minVal becomes 0, maxVal holds the GCD
  return maxVal;
}

// Read input from standard input, assuming UTF-8 encoding
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines
let lineData = rawData.trim().split("\n");

// Main processing loop
while (true) {
  // Get the number of fraction pairs for the current test case
  // Convert to number using unary plus operator
  let currentCaseCount = +lineData.shift();

  // If the count is 0, it signifies the end of input
  if (currentCaseCount === 0) {
    break;
  }

  // Array to store simplified fractions (numerator, denominator)
  let fractionList = [];

  // Loop through each fraction pair for the current test case
  for (let idx = 0; idx < currentCaseCount; idx++) {
    // Parse the current line into two numbers
    let pairValues = lineData.shift().split(" ").map(Number);
    // Calculate the GCD of the two numbers in the pair
    let pairGcd = computeGreatestCommonDivisor(pairValues[0], pairValues[1]);
    // Add the simplified fraction to the list
    fractionList.push([pairValues[0] / pairGcd, pairValues[1] / pairGcd]);
  }

  // Calculate the Least Common Multiple (LCM) of all denominators
  let denominatorLcm = 1;
  fractionList.forEach(function(currentFraction) {
    // Calculate GCD of current denominator and the running LCM
    let currentGcd = computeGreatestCommonDivisor(currentFraction[1], denominatorLcm);
    // Update LCM using the formula: (a * b) / GCD(a, b)
    denominatorLcm = (currentFraction[1] * denominatorLcm) / currentGcd;
  });

  // Convert fractions to equivalent numerators with the common denominator (denominatorLcm)
  let numeratorList = fractionList.map(function(fracItem, itemIndex) {
    return fracItem[0] * (denominatorLcm / fracItem[1]);
  });

  // Calculate the LCM of the new numerators (which are now integers)
  let finalLcm = 1;
  numeratorList.forEach(function(numValue) {
    // Calculate GCD of current numerator and the running LCM
    let numGcd = computeGreatestCommonDivisor(numValue, finalLcm);
    // Update LCM
    finalLcm = (numValue * finalLcm) / numGcd;
  });

  // For each numerator, calculate and print the result (finalLcm / numerator)
  numeratorList.forEach(function(outputValue) {
    console.log(finalLcm / outputValue);
  });
}
