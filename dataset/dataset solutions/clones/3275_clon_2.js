"use strict";

function processData(rawData) {
  let textRows = rawData.split('\n');
  let quantity = parseInt(textRows[0]);
  let vectorP = parseNumbersFromString(textRows[1]).slice(0, quantity);
  let vectorQ = parseNumbersFromString(textRows[2]).slice(0, quantity);

  // Determine the difference between paired elements from the two vectors
  let disparities = vectorP.map(function(valP, idx) {
    return valP - vectorQ[idx];
  });

  // Arrange the disparity values in descending order for processing
  disparities.sort(function(elementX, elementY) {
    return elementY - elementX;
  });

  // Create a boolean array to indicate if an element has been touched
  let modifiedFlags = disparities.map(function(_placeholder) {
    return false;
  });

  // Initialize two indices for the two-pointer algorithm
  let leftPointer = 0;
  let rightPointer = quantity - 1;

  // Continue iterating as long as the left index is less than the right index
  while (leftPointer < rightPointer) {
    let currentDisparity = disparities[rightPointer]; // Fetch the smallest (most negative) disparity

    // If the smallest disparity is no longer negative, no further balancing is needed
    if (currentDisparity >= 0) {
      break;
    }

    // Attempt to balance the smallest negative disparity with the largest positive disparity
    if (disparities[leftPointer] >= -currentDisparity) {
      modifiedFlags[leftPointer] = true;   // Mark the positive contributor as utilized
      modifiedFlags[rightPointer] = true;  // Mark the negative value as adjusted

      disparities[leftPointer] += currentDisparity; // Apply the negative value to the positive one
      disparities[rightPointer] = 0;                // The negative value is now fully compensated
      rightPointer--;                               // Move the right index inward as its element is resolved
    } else {
      // The positive disparity is insufficient to fully compensate the negative one
      if (disparities[leftPointer] > 0) {
        modifiedFlags[leftPointer] = true;   // Mark the positive contributor as utilized
        modifiedFlags[rightPointer] = true;  // Mark the negative value as partially adjusted
      }

      disparities[rightPointer] += disparities[leftPointer]; // Transfer the positive value to the negative one
      disparities[leftPointer] = 0;                          // The positive value is now fully depleted
      leftPointer++;                                         // Move the left index inward as its element is resolved
    }
  }

  // After the balancing loop, check the result
  if (disparities[rightPointer] < 0) {
    // If the last remaining disparity is still negative, a solution was not found
    console.log(-1);
  } else {
    // Otherwise, count the total number of elements that were part of an adjustment
    console.log(modifiedFlags.reduce(function(accumulator, flagValue) {
      return accumulator + flagValue; // Summing boolean values (true=1, false=0)
    }, 0));
  }

  return; // Conclude execution
}


function greatestCommonDivisor(firstNum, secondNum) {
  if (firstNum < secondNum) return greatestCommonDivisor(secondNum, firstNum); // Ensure first argument is larger or equal
  if (secondNum === 0) return firstNum; // Base case for the Euclidean algorithm
  let remainderVal = firstNum % secondNum; // Compute the remainder
  return greatestCommonDivisor(secondNum, remainderVal); // Recursive step
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbersFromString(inputString) {
  return inputString.split(/\s+/).map(function(numericString) {
    return parseInt(numericString); // Convert each string segment to its integer representation
  });
}