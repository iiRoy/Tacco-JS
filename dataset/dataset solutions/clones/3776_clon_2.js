/*
 * This JavaScript module provides a collection of utility functions and a main algorithm
 * designed to process input data. The primary goal is to determine a minimum cost
 * based on color assignments within a grid, utilizing modulo arithmetic and dynamic programming-like
 * calculations. It includes a polyfill for string replication and helper functions for
 * parsing and numerical computations.
 */

// Establish a polyfill for String.prototype.replicate if it's not natively available.
if (!String.prototype.replicate) {
  // This function extends the String prototype to allow repeating a string a specified number of times.
  String.prototype.replicate = function (repetitionCount) {
    'use strict'; // Operate in strict mode for cleaner error handling.

    // Validate the context (the string itself) to ensure it's not null or undefined.
    if (this == null) {
      throw new TypeError('Cannot convert value ' + this + ' to object for string replication');
    }

    // Convert the 'this' context to a primitive string value.
    var baseText = '' + this;
    // Coerce the input repetition count to a numeric type.
    repetitionCount = +repetitionCount;

    // Handle cases where repetitionCount evaluates to NaN (Not-a-Number).
    if (repetitionCount !== repetitionCount) {
      repetitionCount = 0;
    }
    // Ensure the repetition count is not negative.
    if (repetitionCount < 0) {
      throw new RangeError('The replication count must be a non-negative number');
    }
    // Prevent replication with an infinite count, which would lead to an endless string.
    if (repetitionCount === Infinity) {
      throw new RangeError('The replication count must be less than positive infinity');
    }

    // Round down the count to the nearest whole number, as partial repetitions are not sensible.
    repetitionCount = Math.floor(repetitionCount);

    // Optimize for trivial cases: an empty string or zero repetitions results in an empty string.
    if (baseText.length === 0 || repetitionCount === 0) {
      return '';
    }

    // Check for potential overflow of string size, preventing memory exhaustion.
    if (baseText.length * repetitionCount >= (1 << 28)) { // 2^28 is a common internal string size limit.
      throw new RangeError('Replication count would exceed the maximum allowable string size');
    }

    var finalResult = ''; // Initialize an empty string to accumulate the result.
    // Employ a binary exponentiation (doubling) approach for efficient string replication.
    for (;;) {
      // If the current bit of the count is 1, append the current baseText to the result.
      if ((repetitionCount & 1) === 1) {
        finalResult += baseText;
      }
      // Right-shift the count by 1 bit, effectively dividing it by 2.
      repetitionCount >>>= 1;
      // If the count becomes zero, all bits have been processed, and we can exit.
      if (repetitionCount === 0) {
        break;
      }
      // Double the baseText for the next iteration, preparing for the next bit.
      baseText += baseText;
    }
    return finalResult; // Return the fully replicated string.
  };
}

// Compares two objects to determine if they have the same own property names and strictly equal values.
function checkObjectEquivalence(firstObj, secondObj) {
  var propNamesA = Object.getOwnPropertyNames(firstObj); // Get enumerable and non-enumerable own property names of first object.
  var propNamesB = Object.getOwnPropertyNames(secondObj); // Get property names of second object.

  // If the number of properties differs, the objects cannot be equivalent.
  if (propNamesA.length !== propNamesB.length) {
    return false;
  }

  // Iterate through the property names of the first object.
  for (var idx = 0; idx < propNamesA.length; idx++) {
    var currentPropName = propNamesA[idx]; // Get the current property name.
    // Perform a strict inequality check on the values associated with the current property name.
    if (firstObj[currentPropName] !== secondObj[currentPropName]) {
      return false; // If any value differs, objects are not equivalent.
    }
  }
  return true; // If all properties and values match, objects are equivalent.
}

// A straightforward helper to parse a string into an integer, specifically using base 10.
function parseDecimalInteger(inputStringValue) {
  return parseInt(inputStringValue, 10); // Standard parseInt function with a specified radix.
}

// Pre-calculates and stores powers of the base 6 for later use in `computeResult`.
var powersOfSix = [6, 5, 4, 3, 2, 1].map(function (exponentVal) {
  return Math.pow(6, exponentVal); // Computes 6^6, 6^5, ..., 6^1.
});

// Pre-calculates and stores powers of the base 9 for later use in `computeResult`.
var powersOfNine = [5, 4, 3, 2, 1].map(function (exponentVal) {
  return Math.pow(9, exponentVal); // Computes 9^5, 9^4, ..., 9^1.
});

// Recursively computes a value based on the input number, using pre-calculated powers of 6 and 9.
function computeResult(targetValue) {
  // Base case 1: If the target value is less than 6, return the value itself.
  if (targetValue < 6) {
    return targetValue;
  }
  // Base case 2: If the target value is less than 9, return 1 plus the difference from 6.
  if (targetValue < 9) {
    return 1 + (targetValue - 6);
  }

  // Recursive step: Find the largest power of 6 or 9 that is less than or equal to the targetValue.
  // Then, recursively call `computeResult` with the reduced target and add 1 for the operation.
  // We take the minimum of these two possibilities.
  return Math.min(
    computeResult(targetValue - powersOfSix.find(function (powerVal) { return powerVal <= targetValue; })) + 1,
    computeResult(targetValue - powersOfNine.find(function (powerVal) { return powerVal <= targetValue; })) + 1
  );
}

// The main entry point function that orchestrates the input processing and solution calculation.
function processDataEntry(fullInputText) {
  // Split the entire input text into an array of individual lines.
  var inputLineArray = fullInputText.split("\n");

  // Extract and parse the first line, which contains configuration parameters.
  var configurationParameters = inputLineArray.shift().split(" ").map(function (strToken) {
    return parseDecimalInteger(strToken); // Convert string tokens to integers.
  });

  var gridDimensionN = configurationParameters[0]; // N: Represents the size of the square grid (N x N).
  var totalColorsC = configurationParameters[1];   // C: Represents the total number of distinct colors available.

  // Parse the color cost matrix 'D'. This matrix defines costs for changing one color to another.
  var colorCostMatrix = inputLineArray.splice(0, totalColorsC).map(function (lineContent) {
    return lineContent.split(" ").map(function (numericString) {
      return parseDecimalInteger(numericString); // Convert each cost value to an integer.
    });
  });

  // Parse the initial configuration of cell colors in the grid 'c'.
  var initialCellColors = inputLineArray.splice(0, gridDimensionN).map(function (lineContent) {
    return lineContent.split(" ").map(function (numericString) {
      return parseDecimalInteger(numericString); // Convert each cell color value to an integer.
    });
  });

  // Initialize a 2D array to store color statistics grouped by (row + col) % 3.
  // Each inner array represents a modulo group and tracks counts for each color.
  var moduloGroupColorStatistics = [
    "".replicate(totalColorsC).split("").map(function () { return 0; }), // Statistics for modulo group 0.
    "".replicate(totalColorsC).split("").map(function () { return 0; }), // Statistics for modulo group 1.
    "".replicate(totalColorsC).split("").map(function () { return 0; })  // Statistics for modulo group 2.
  ];

  // Iterate through the initial grid to populate the color statistics.
  initialCellColors.forEach(function (gridRow, rowIdx) {
    gridRow.forEach(function (cellColorValue, colIdx) {
      // Increment the count for the specific color within its determined modulo group.
      moduloGroupColorStatistics[(rowIdx + colIdx) % 3][cellColorValue - 1]++;
    });
  });

  // Calculate the cost scores for each modulo group if its cells were all changed to a specific target color.
  var moduloGroupScores = moduloGroupColorStatistics.map(function (colorStats) {
    return "".replicate(totalColorsC).split("").map(function (dummy, targetColorIdx) {
      // For each potential target color, calculate the total conversion cost for the current group.
      return colorStats.map(function (currentCount, sourceColorIdx) {
        // If the source and target colors are identical, the cost is zero.
        // Otherwise, calculate cost as count of original color * cost to change it to target.
        return sourceColorIdx === targetColorIdx ? 0 : currentCount * colorCostMatrix[sourceColorIdx][targetColorIdx];
      }).reduce(function (cumulativeSum, currentCost) {
        return cumulativeSum + currentCost; // Sum up all individual color conversion costs.
      }, 0); // Start the summation with an initial value of zero.
    });
  });

  var overallMinimumCost = Infinity; // Initialize the minimum cost to an infinitely large value.

  // Iterate through all possible combinations of three distinct colors (one for each modulo group).
  for (var firstColorOption = 0; firstColorOption < totalColorsC; firstColorOption++) {
    for (var secondColorOption = 0; secondColorOption < totalColorsC; secondColorOption++) {
      // Ensure the first and second chosen colors are not the same.
      if (firstColorOption === secondColorOption) {
        continue;
      }
      for (var thirdColorOption = 0; thirdColorOption < totalColorsC; thirdColorOption++) {
        // Ensure the third chosen color is distinct from both the first and second colors.
        if (secondColorOption === thirdColorOption || firstColorOption === thirdColorOption) {
          continue;
        }
        // Calculate the total score for the current combination of three colors.
        // Update the overall minimum cost if the current combination yields a lower total.
        overallMinimumCost = Math.min(
          overallMinimumCost,
          moduloGroupScores[0][firstColorOption] +
          moduloGroupScores[1][secondColorOption] +
          moduloGroupScores[2][thirdColorOption]
        );
      }
    }
  }

  // Output the lowest total cost found across all valid color combinations.
  console.log(overallMinimumCost);
}

// Invoke the main processing function, reading input from standard input using Node.js's file system module.
processDataEntry(require("fs").readFileSync("/dev/stdin", "utf8"));