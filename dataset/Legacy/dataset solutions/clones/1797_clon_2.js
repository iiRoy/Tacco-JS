"use strict";

// Core module for file system operations
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Parse input into an array of tokens, splitting by spaces or newlines
var tokenStream = rawData.split(/ |\n/);
// Pointer to the current token in the stream
var tokenIndex = 0;

/**
 * Retrieves the next token and converts it to a numeric type.
 * @returns {number} The parsed number.
 */
function readNum() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token as a string.
 * @returns {string} The parsed string.
 */
function readStr() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token and converts it to a BigInt.
 * @returns {BigInt} The parsed BigInt.
 */
function readBig() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a sequence of 'count' tokens from the stream.
 * @param {number} count - Number of tokens to read.
 * @param {boolean} asNumbers - If true, converts tokens to numbers.
 * @returns {Array<string|number>} An array containing the tokens.
 */
function readSeq(count, asNumbers) {
  if (asNumbers) {
    return tokenStream.slice(tokenIndex, (tokenIndex += count)).map((item) => +item);
  } else {
    return tokenStream.slice(tokenIndex, (tokenIndex += count));
  }
}

/**
 * Reads a 2D matrix of specified dimensions.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in each row.
 * @param {boolean} asNumbers - If true, converts elements to numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function readMatrix(rows, cols, asNumbers) {
  var matrixData = [];
  var rowIterator = 0;
  if (asNumbers) {
    for (; rowIterator < rows; rowIterator++) {
      matrixData.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((item) => +item));
    }
  } else {
    for (; rowIterator < rows; rowIterator++) {
      matrixData.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
    }
  }
  return matrixData;
}

/**
 * Dynamically creates a multi-dimensional array.
 * (This utility function is present but not utilized in the main algorithm.)
 * @param {*} initialValue - The default value for array elements.
 * @returns {Array} A new multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var functionArgs = arguments,
    argumentCount = functionArgs.length,
    evalString = "Array(functionArgs[" + --argumentCount + "]).fill().map(elem => {return " + initialValue + ";})";
  while (--argumentCount) {
    evalString = "Array(functionArgs[" + argumentCount + "]).fill().map(elem =>" + evalString + ")";
  }
  return eval(evalString);
}

// Execute the primary logic of the program
var programResult = executeProgram();

// Output the result if it's not undefined
if (programResult !== undefined) {
  console.log(String(programResult));
}

/**
 * Contains the main algorithm for processing items and queries.
 * This function implements a variation of the knapsack problem or subset sum,
 * optimizing for value given a maximum weight, using a divide-and-conquer
 * approach based on binary tree-like indexing.
 * @returns {string} A newline-separated string of query answers.
 */
function executeProgram() {
  var itemCount = readNum(); // Total number of available items
  var itemData = readMatrix(itemCount, 2); // Each item has [value, weight]

  var depthSplitPoint = 11; // A constant defining a threshold for pre-calculation depth
  var precalcLimit = Math.min(itemCount, 1 << depthSplitPoint); // Upper bound for pre-calculated combinations

  // 'precomputedCombos' stores combinations for items up to 'precalcLimit'.
  // Each entry `precomputedCombos[i]` is an array of [totalValue, totalWeight] pairs,
  // sorted by weight, and filtered to include only Pareto-optimal combinations.
  var precomputedCombos = Array(precalcLimit);

  // Initialize the first entry with the first item's data
  precomputedCombos[0] = [itemData[0]];

  // Populate `precomputedCombos` using a bottom-up approach, similar to building a segment tree
  for (var currentIdx = 1; currentIdx < precalcLimit; currentIdx++) {
    // Determine the binary depth (log base 2) of the current index + 1
    var currentDepth = 31 - Math.clz32(currentIdx + 1);
    // Calculate the parent index in a binary tree structure
    var parentNodeIdx = (currentIdx - 1) >> 1;

    // Start with combinations inherited from the parent node
    var combinedList = precomputedCombos[parentNodeIdx].concat();
    // Add the current item itself as a valid combination
    combinedList.push(itemData[currentIdx]);

    // Combine the current item with all combinations from its parent
    for (var comboIterator = 0; comboIterator < precomputedCombos[parentNodeIdx].length; comboIterator++) {
      var parentCombo = precomputedCombos[parentNodeIdx][comboIterator];
      // Only add if the total weight does not exceed 100,000
      if (parentCombo[1] + itemData[currentIdx][1] <= 1e5) {
        combinedList.push([parentCombo[0] + itemData[currentIdx][0], parentCombo[1] + itemData[currentIdx][1]]);
      }
    }

    // Sort the combined list primarily by total weight
    combinedList.sort((comboA, comboB) => comboA[1] - comboB[1]);

    // Filter the sorted list to keep only Pareto-optimal combinations:
    // for increasing weight, value must also be non-decreasing.
    precomputedCombos[currentIdx] = [combinedList[0]]; // Always include the lowest weight combination
    for (var comboIterator = 1; comboIterator < combinedList.length; comboIterator++) {
      // If the current combination offers a higher value than the last optimal one added, include it
      if (combinedList[comboIterator][0] > precomputedCombos[currentIdx][precomputedCombos[currentIdx].length - 1][0]) {
        precomputedCombos[currentIdx].push(combinedList[comboIterator]);
      }
    }
  }

  var numQueries = readNum(); // Number of queries to process
  var queryAnswers = Array(numQueries); // Array to store results for each query

  // Process each individual query
  for (var queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    var targetItemIdx = readNum(); // The 1-based index of the target item
    var maximumWeight = readNum(); // The maximum allowed total weight for this query

    var targetDepth = 31 - Math.clz32(targetItemIdx); // Binary depth of the target item
    var currentMaxResult = 0; // Stores the best value found for the current query

    targetItemIdx--; // Convert to 0-based index for array access

    // Case 1: Target item is within the pre-calculated range (shallow depth)
    if (targetDepth < depthSplitPoint) {
      // Iterate through the pre-calculated combinations for this target item
      for (var comboIterator = 0; comboIterator < precomputedCombos[targetItemIdx].length; comboIterator++) {
        var combo = precomputedCombos[targetItemIdx][comboIterator];
        // If this combination yields a higher value and is within the weight limit
        if (currentMaxResult < combo[0] && combo[1] <= maximumWeight) {
          currentMaxResult = combo[0]; // Update the maximum value
        }
      }
      queryAnswers[queryIdx] = currentMaxResult; // Store the result for this query
    } else {
      // Case 2: Target item is beyond the pre-calculated range (deeper depth)
      // Dynamically build combinations by traversing up the "tree" from the target item
      var dynamicCombos = [itemData[targetItemIdx]]; // Start with the target item itself
      targetItemIdx = (targetItemIdx - 1) >> 1; // Move to its parent

      // Traverse upwards until the depthSplitPoint is reached
      for (var depthIterator = targetDepth; depthIterator >= depthSplitPoint; depthIterator--) {
        var initialDynamicLength = dynamicCombos.length;
        dynamicCombos.push(itemData[targetItemIdx]); // Add the current item in the path

        // Combine the current item with all existing dynamic combinations
        for (var comboIterator = 0; comboIterator < initialDynamicLength; comboIterator++) {
          var existingDynamicCombo = dynamicCombos[comboIterator];
          // Only add if the combined weight is within 100,000
          if (existingDynamicCombo[1] + itemData[targetItemIdx][1] <= 1e5) {
            dynamicCombos.push([existingDynamicCombo[0] + itemData[targetItemIdx][0], existingDynamicCombo[1] + itemData[targetItemIdx][1]]);
          }
        }
        targetItemIdx = (targetItemIdx - 1) >> 1; // Move to the next parent
      }

      // Sort the dynamically generated combinations by weight
      dynamicCombos.sort((comboA, comboB) => comboA[1] - comboB[1]);

      // Post-process dynamicCombos for Pareto optimality and mark invalid weights
      var rightBoundary = dynamicCombos.length;
      for (var comboIterator = 1; comboIterator < rightBoundary; comboIterator++) {
        // If a combination has a lower value than the previous one (after sorting by weight),
        // it's not optimal. Replace its value with the previous one's and mark its weight as effectively infinite.
        if (dynamicCombos[comboIterator][0] < dynamicCombos[comboIterator - 1][0]) {
          dynamicCombos[comboIterator][0] = dynamicCombos[comboIterator - 1][0];
          dynamicCombos[comboIterator][1] = 1e6; // A large value to signify invalid/unusable weight
        }
      }
      rightBoundary--; // Adjust pointer for the two-pointer search below

      // Combine the dynamically generated combinations with the relevant pre-calculated combinations
      // (targetItemIdx now points to the node in `precomputedCombos` that is the ancestor at `depthSplitPoint`)
      for (var comboIterator = 0; comboIterator < precomputedCombos[targetItemIdx].length; comboIterator++) {
        var precalcEntry = precomputedCombos[targetItemIdx][comboIterator];
        // Skip if the pre-calculated entry itself has an effectively invalid weight
        if (precalcEntry[1] > 1e5) continue;

        // Use a two-pointer approach to find the best match from `dynamicCombos`
        // Find the largest `dynamicCombos` element whose combined weight with `precalcEntry`
        // does not exceed `maximumWeight`.
        while (rightBoundary >= 0 && dynamicCombos[rightBoundary][1] + precalcEntry[1] > maximumWeight) {
          rightBoundary--;
        }

        // If no valid combination is found in `dynamicCombos` for the current `precalcEntry`, break
        if (rightBoundary < 0) break;

        // Update the maximum value if a better overall combination is found
        if (currentMaxResult < dynamicCombos[rightBoundary][0] + precalcEntry[0]) {
          currentMaxResult = dynamicCombos[rightBoundary][0] + precalcEntry[0];
        }
      }
      queryAnswers[queryIdx] = currentMaxResult; // Store the result for this query
    }
  }
  // Return all query answers joined by newlines
  return queryAnswers.join("\n");
}
