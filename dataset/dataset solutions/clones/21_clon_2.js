let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

let lineCollection = (rawData.trim()).split("\n");

for (let idx = 0; idx < lineCollection.length; idx++) {
  let parsedNumbers = lineCollection[idx].split(" ");

  // Arrange numbers in descending order
  parsedNumbers.sort(function(valA, valB) {
    return valB - valA;
  });

  console.log(parsedNumbers);
  calculateGCDLCM(parsedNumbers);
}

// This function computes the Greatest Common Divisor (GCD) and Least Common Multiple (LCM)
function calculateGCDLCM(numberPair) {
  let firstNum = numberPair[0];
  let secondNum = numberPair[1];

  // Determine GCD using the Euclidean algorithm
  let tempX = firstNum;
  let tempY = secondNum;
  let remainder;

  while ((remainder = tempX % tempY) !== 0) {
    tempX = tempY;
    tempY = remainder;
  }
  let greatestCommonDivisor = tempY;

  // Determine LCM using the formula: LCM(a, b) = (a * b) / GCD(a, b)
  let leastCommonMultiple = (firstNum * secondNum) / greatestCommonDivisor;

  // Display the computed LCM and GCD
  console.log(leastCommonMultiple + " " + greatestCommonDivisor);
}
