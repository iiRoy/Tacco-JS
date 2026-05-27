"use strict";

// This module handles file system operations to read input data.
const fileSystemModule = require("fs");

// Read all input from standard input, decoding it as UTF-8.
const rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Split the input into tokens using spaces or newlines as delimiters.
const inputTokens = rawInputData.split(/ |\n/);

// Initialize an index to keep track of the current token being processed.
let tokenIndex = 0;

/**
 * Retrieves the next token from the input stream and converts it to a number.
 * @returns {number} The next numeric token.
 */
function getNextNumber() {
  return +inputTokens[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The next string token.
 */
function getNextString() {
  return inputTokens[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function getNextBigInt() {
  return BigInt(inputTokens[tokenIndex++]);
}

/**
 * Retrieves an array of numbers or strings from the input stream.
 * @param {number} count - The number of elements to retrieve.
 * @param {boolean} asStrings - If true, elements are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array of tokens.
 */
function getNumbersArray(count, asStrings) {
  if (asStrings) {
    return inputTokens.slice(tokenIndex, (tokenIndex += count));
  } else {
    return inputTokens.slice(tokenIndex, (tokenIndex += count)).map((valStr) => +valStr);
  }
}

/**
 * Retrieves a 2D matrix of numbers or strings from the input stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} asStrings - If true, elements are returned as strings; otherwise, as numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function getMatrix(height, width, asStrings) {
  const resultMatrix = [];
  let rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(inputTokens.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      resultMatrix.push(inputTokens.slice(tokenIndex, (tokenIndex += width)).map((elementStr) => +elementStr));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array of zeros).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const argsList = arguments;
  let argCount = argsList.length;
  let arrayCreationCode = "Array(argsList[" + --argCount + "]).fill().map(_=>{return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationCode = "Array(argsList[" + argCount + "]).fill().map(_=>" + arrayCreationCode + ")";
  }
  return eval(arrayCreationCode);
}

// Initialize a variable to accumulate the total score.
let totalScore = 0;

// Execute the main logic of the program.
const programOutput = executeLogic();

// If the program produced any output, print it to the console.
if (programOutput !== undefined) {
  console.log(String(programOutput));
}

// The core logic of the application.
function executeLogic() {
  // Read the number of days for the competition.
  const numDays = getNextNumber(); // e.g., 365 days

  // Define the number of available contests.
  const numContests = 26;

  // Read the satisfaction decrement values for each contest.
  const satisfactionDecrements = getNumbersArray(numContests);

  // Initialize an array to keep track of the last day each contest was held.
  // All contests are initially considered not held recently (value 0).
  const lastHeldDays = createMultiDimArray(0, numContests);

  // An array to store the chosen contest ID for each day.
  const chosenContests = [];

  // Iterate through each day of the competition.
  for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
    // Read the daily scores for each contest.
    const dailyScores = getNumbersArray(numContests);

    // Initialize variables to find the best contest for the current day.
    let maxSatisfaction = -1e9; // A very small number to ensure any valid score is greater.
    let bestContestId = 0; // The index of the chosen contest.

    // Evaluate each contest to find the one with the highest satisfaction.
    for (let contestIndex = 0; contestIndex < numContests; contestIndex++) {
      // Decrease the satisfaction for contests not held today.
      lastHeldDays[contestIndex] -= satisfactionDecrements[contestIndex];

      // Calculate the potential satisfaction if this contest is chosen today.
      const currentContestSatisfaction = dailyScores[contestIndex] - lastHeldDays[contestIndex] + satisfactionDecrements[contestIndex];

      // If this contest offers higher satisfaction, update the best choice.
      if (maxSatisfaction < currentContestSatisfaction) {
        maxSatisfaction = currentContestSatisfaction;
        bestContestId = contestIndex;
      }
    }

    // Record the chosen contest (1-indexed) for the current day.
    chosenContests[dayIndex] = bestContestId + 1;

    // Reset the last held day for the chosen contest to 0 (meaning it was held today).
    lastHeldDays[bestContestId] = 0;

    // Add the score from the chosen contest to the total score.
    totalScore += dailyScores[bestContestId];

    // Add the accumulated satisfaction decrements from all other contests to the total score.
    for (let k = 0; k < numContests; k++) {
      totalScore += lastHeldDays[k];
    }
  }

  // Return the list of chosen contests, formatted as a newline-separated string.
  return chosenContests.join("\n");
}
