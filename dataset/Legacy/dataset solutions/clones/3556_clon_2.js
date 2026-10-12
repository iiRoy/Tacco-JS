'use strict';

// This function processes the input data to find the greatest common divisor
// of absolute differences between numbers and a target value.
function ProcessData(rawData) {
  // Parse the first line of input to get the count of numbers and the target value.
  const countItems = Number(rawData.split('\n')[0].split(' ')[0]);
  const targetValue = Number(rawData.split('\n')[0].split(' ')[1]);

  // Initialize an array to store the absolute differences.
  let diffsArray = [];

  // Loop through the numbers provided in the second line of input.
  for (let idx = 0; idx < countItems; idx++) {
    // Calculate the absolute difference between each number and the target value,
    // then add it to our differences array.
    diffsArray.push(Math.abs(Number(rawData.split('\n')[1].split(' ')[idx]) - targetValue));
  }

  // Helper function to compute the greatest common divisor (GCD) of two integers
  function calculateGCD(firstNum, secondNum) {
    let remainderVal; // Variable to hold the remainder during Euclidean algorithm

    // Ensure firstNum is greater than or equal to secondNum for consistent calculation
    if (firstNum < secondNum) {
      remainderVal = firstNum;
      firstNum = secondNum;
      secondNum = remainderVal;
    }

    // Euclidean algorithm to find GCD
    while ((remainderVal = firstNum % secondNum) !== 0) {
      firstNum = secondNum;
      secondNum = remainderVal;
    }

    return secondNum; // The GCD is the last non-zero remainder
  }

  // Check if there's only one difference value.
  if (diffsArray.length === 1) {
    // If so, that single difference is the result.
    console.log(diffsArray[0]);
  } else {
    // If there are multiple differences, calculate the GCD iteratively.
    let finalGCDResult = calculateGCD(diffsArray[0], diffsArray[1]);

    // Iterate through the rest of the differences to find the GCD of all of them.
    for (let loopIndex = 1; loopIndex < countItems; loopIndex++) {
      finalGCDResult = calculateGCD(finalGCDResult, diffsArray[loopIndex]);
    }
    // Output the final calculated GCD.
    console.log(finalGCDResult);
  }
}

// Read input from standard input, decode as UTF-8, and trim whitespace.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
