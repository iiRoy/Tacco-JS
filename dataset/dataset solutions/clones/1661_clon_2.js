"use strict";

// Core module for file system operations, used to read input.
const fileSystem = require("fs");

// Read the entire standard input stream as a UTF-8 string.
let rawData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of tokens using space or newline as delimiters.
let tokenStream = rawData.split(/ |\n/);

// Initialize an index to track the current position within the token stream.
let tokenIndex = 0;

/**
 * Retrieves the next token from the global token stream and converts it to a number.
 * @returns {number} The numeric value of the next token.
 */
function getNextNum() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the global token stream as a string.
 * @returns {string} The string value of the next token.
 */
function getNextStr() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the global token stream and converts it to a BigInt.
 * @returns {BigInt} The BigInt value of the next token.
 */
function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Extracts a specified number of tokens from the stream, optionally parsing them as numbers.
 * @param {number} count - The number of tokens to extract.
 * @param {boolean} [shouldParseNumbers=false] - If true, tokens are converted to numbers; otherwise, they remain strings.
 * @returns {Array<string|number>} An array containing the extracted tokens.
 */
function getNumsArray(count, shouldParseNumbers) {
  if (shouldParseNumbers) {
    return tokenStream.slice(tokenIndex, tokenIndex += count).map(item => +item);
  } else {
    return tokenStream.slice(tokenIndex, tokenIndex += count);
  }
}

/**
 * Extracts a 2D matrix of tokens from the stream, optionally parsing elements as numbers.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns per row.
 * @param {boolean} [shouldParseNumbers=false] - If true, matrix elements are converted to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function getMatrix(height, width, shouldParseNumbers) {
  let resultMatrix = [];
  let rowCounter = 0;
  if (shouldParseNumbers) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(item => +item));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array based on provided dimensions and an initial value expression.
 * @param {string} initialValue - A string representing the initial value or expression for each element (e.g., "[]", "0").
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let args = arguments;
  let argLength = args.length;
  // Construct the innermost array creation string.
  let arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  // Wrap with outer array creations for higher dimensions.
  while (--argLength) {
    arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayCreationString);
}

// Execute the primary logic of the program.
let programResult = solveProblem();

// If the result from the main function is not undefined, print it to the console.
if (programResult !== undefined) {
  console.log(String(programResult));
}

/**
 * Contains the main algorithm to solve the problem, involving processing coordinates and directions
 * to find minimum distances between points.
 * @returns {string|number} "SAFE" if no collisions are found, otherwise the calculated minimum distance multiplied by 5.
 */
function solveProblem() {
  // Define a large number to represent an effectively infinite distance.
  const infinityVal = 1_000_000_000; // Represents 1e9

  // Read the total number of data entries to process.
  let numEntries = getNextNum();

  // Initialize a 4-element array, where each element is an empty array.
  // This structure will categorize points based on their initial direction.
  let categorizedData = createMultiDimArray("[]", 4);

  // A mapping from direction characters to numerical indices for `categorizedData`.
  const directionMap = {
    U: 0, // Upward direction
    R: 1, // Rightward direction
    D: 2, // Downward direction
    L: 3  // Leftward direction
  };

  // Loop through each input entry to parse coordinates and direction.
  for (let idx = 0; idx < numEntries; idx++) {
    let coordX = getNextNum();
    let coordY = getNextNum();
    let directionChar = getNextStr();
    // Store the point's data [x, y, x-y, x+y] into the appropriate category array.
    categorizedData[directionMap[directionChar]].push([coordX, coordY, coordX - coordY, coordX + coordY]);
  }

  // Initialize the minimum distance found to the maximum possible value.
  let minDistance = infinityVal;

  // Sort each category array based on specific coordinate values for efficient searching.
  // Category 0 (U) sorted by X-coordinate.
  categorizedData[0].sort((firstItem, secondItem) => firstItem[0] - secondItem[0]);
  // Category 1 (R) sorted by Y-coordinate.
  categorizedData[1].sort((firstItem, secondItem) => firstItem[1] - secondItem[1]);
  // Category 2 (D) sorted by X-coordinate.
  categorizedData[2].sort((firstItem, secondItem) => firstItem[0] - secondItem[0]);
  // Category 3 (L) sorted by Y-coordinate.
  categorizedData[3].sort((firstItem, secondItem) => firstItem[1] - secondItem[1]);

  // First set of comparisons: U vs D (categoryIdx=0), R vs L (categoryIdx=1).
  // These check for collisions along horizontal or vertical lines.
  for (let categoryIdx = 0; categoryIdx < 2; categoryIdx++) {
    let searchPointer = 0; // Pointer for the second array in the comparison pair.
    // Only proceed if the 'opposite' category has elements to compare against.
    if (categorizedData[categoryIdx + 2].length) {
      // Iterate through each item in the 'current' category.
      for (let idx = 0; idx < categorizedData[categoryIdx].length; idx++) {
        // Advance the search pointer in the 'opposite' category until its relevant coordinate
        // is greater than or equal to the current item's relevant coordinate.
        while (categorizedData[categoryIdx + 2].length > searchPointer &&
               categorizedData[categoryIdx + 2][searchPointer][categoryIdx] < categorizedData[categoryIdx][idx][categoryIdx]) {
          searchPointer++;
        }
        // If the search pointer has reached the end, no more potential matches for this category.
        if (searchPointer === categorizedData[categoryIdx + 2].length) {
          break;
        }
        // Check for a collision condition:
        // 1. Relevant coordinates are identical.
        // 2. The 'other' coordinate of the current item is less than the 'other' coordinate of the opposite item.
        if (categorizedData[categoryIdx][idx][categoryIdx] === categorizedData[categoryIdx + 2][searchPointer][categoryIdx] &&
            categorizedData[categoryIdx][idx][1 - categoryIdx] < categorizedData[categoryIdx + 2][searchPointer][1 - categoryIdx]) {
          // Update the minimum distance found.
          minDistance = Math.min(minDistance, categorizedData[categoryIdx + 2][searchPointer][1 - categoryIdx] - categorizedData[categoryIdx][idx][1 - categoryIdx]);
        }
      }
    }
  }

  // Re-sort all categorized data arrays based on the (x+y) coordinate (index 3).
  // This sorting is crucial for detecting diagonal collisions.
  categorizedData[0].sort((firstItem, secondItem) => firstItem[3] - secondItem[3]);
  categorizedData[1].sort((firstItem, secondItem) => firstItem[3] - secondItem[3]);
  categorizedData[2].sort((firstItem, secondItem) => firstItem[3] - secondItem[3]);
  categorizedData[3].sort((firstItem, secondItem) => firstItem[3] - secondItem[3]);

  // Second set of comparisons: U vs R (categoryIdx=0), D vs L (categoryIdx=2).
  // These check for diagonal collisions where x+y is constant.
  for (let categoryIdx = 0; categoryIdx < 4; categoryIdx += 2) {
    let searchPointer = 0; // Pointer for the second array in the comparison pair.
    // Only proceed if the 'adjacent' category has elements.
    if (categorizedData[categoryIdx + 1].length) {
      // Iterate through each item in the 'current' category.
      for (let idx = 0; idx < categorizedData[categoryIdx].length; idx++) {
        // Advance the search pointer in the 'adjacent' category until its (x+y) coordinate
        // is greater than or equal to the current item's (x+y) coordinate.
        while (categorizedData[categoryIdx + 1].length > searchPointer &&
               categorizedData[categoryIdx + 1][searchPointer][3] < categorizedData[categoryIdx][idx][3]) {
          searchPointer++;
        }
        // If the search pointer has reached the end, no more potential matches.
        if (searchPointer === categorizedData[categoryIdx + 1].length) {
          break;
        }
        // Check for a diagonal collision condition:
        // 1. (x+y) coordinates are identical.
        // 2. The 'other' coordinate (x or y) of the current item is less than the 'other' coordinate of the adjacent item.
        if (categorizedData[categoryIdx][idx][3] === categorizedData[categoryIdx + 1][searchPointer][3] &&
            categorizedData[categoryIdx][idx][1 - categoryIdx / 2] < categorizedData[categoryIdx + 1][searchPointer][1 - categoryIdx / 2]) {
          // Update the minimum distance, multiplying by 2 for diagonal distance.
          minDistance = Math.min(minDistance, (categorizedData[categoryIdx + 1][searchPointer][1 - categoryIdx / 2] - categorizedData[categoryIdx][idx][1 - categoryIdx / 2]) * 2);
        }
      }
    }
  }

  // Re-sort all categorized data arrays based on the (x-y) coordinate (index 2).
  // This sorting is for detecting the other type of diagonal collisions.
  categorizedData[0].sort((firstItem, secondItem) => firstItem[2] - secondItem[2]);
  categorizedData[1].sort((firstItem, secondItem) => firstItem[2] - secondItem[2]);
  categorizedData[2].sort((firstItem, secondItem) => firstItem[2] - secondItem[2]);
  categorizedData[3].sort((firstItem, secondItem) => firstItem[2] - secondItem[2]);

  // Third set of comparisons: U vs L (categoryIdx=0), R vs D (categoryIdx=1).
  // These check for diagonal collisions where x-y is constant.
  for (let categoryIdx = 0; categoryIdx < 2; categoryIdx++) {
    let searchPointer = 0; // Pointer for the second array in the comparison pair.
    // Only proceed if the 'opposite diagonal' category has elements.
    if (categorizedData[3 - categoryIdx].length) {
      // Iterate through each item in the 'current' category.
      for (let idx = 0; idx < categorizedData[categoryIdx].length; idx++) {
        // Advance the search pointer in the 'opposite diagonal' category until its (x-y) coordinate
        // is greater than or equal to the current item's (x-y) coordinate.
        while (categorizedData[3 - categoryIdx].length > searchPointer &&
               categorizedData[3 - categoryIdx][searchPointer][2] < categorizedData[categoryIdx][idx][2]) {
          searchPointer++;
        }
        // If the search pointer has reached the end, no more potential matches.
        if (searchPointer === categorizedData[3 - categoryIdx].length) {
          break;
        }
        // Check for a diagonal collision condition:
        // 1. (x-y) coordinates are identical.
        // 2. The X coordinate of the current item is less than the X coordinate of the opposite diagonal item.
        if (categorizedData[categoryIdx][idx][2] === categorizedData[3 - categoryIdx][searchPointer][2] &&
            categorizedData[categoryIdx][idx][0] < categorizedData[3 - categoryIdx][searchPointer][0]) {
          // Update the minimum distance, multiplying by 2 for diagonal distance.
          minDistance = Math.min(minDistance, (categorizedData[3 - categoryIdx][searchPointer][0] - categorizedData[categoryIdx][idx][0]) * 2);
        }
      }
    }
  }

  // If no collisions were found (minDistance remains infinityVal), return "SAFE".
  // Otherwise, return the minimum distance multiplied by 5 as per problem requirements.
  return minDistance === infinityVal ? "SAFE" : minDistance * 5;
}
