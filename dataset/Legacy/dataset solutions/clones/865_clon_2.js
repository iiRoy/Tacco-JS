// This script processes musical phrase data to calculate maximum scores for target melody lengths.
// It uses dynamic programming to solve a variation of the knapsack problem.

var fileSystem = require('fs'); // Node.js file system module for file operations
var dataLength = fileSystem.fstatSync(process.stdin.fd).size; // Determine the size of the standard input stream
var inputBuffer = new Buffer(dataLength); // Allocate a buffer to store the incoming data
var readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0); // Read data from stdin into the buffer
var inputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n'); // Convert buffer content to UTF-8 string and split into an array of lines

// Initiate the primary execution flow of the application
executeProgram();

/**
 * Generates a two-dimensional array (matrix) and initializes all its elements.
 * @param {number} rowsCount - The total number of rows for the new matrix.
 * @param {number} colsCount - The total number of columns for the new matrix.
 * @param {*} initialValue - The default value to assign to each cell in the matrix.
 * @returns {Array<Array<*>>} A newly created 2D array with specified dimensions and initialization.
 */
function create2DArray(rowsCount, colsCount, initialValue) {
  var resultArray = []; // Declare the array that will hold the rows
  var rowIndex, colIndex; // Loop iterators for rows and columns

  // Iterate through each row index
  for (rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    resultArray[rowIndex] = []; // Initialize the current row as an empty array
    // Iterate through each column index within the current row
    for (colIndex = 0; colIndex < colsCount; colIndex++) {
      resultArray[rowIndex][colIndex] = initialValue; // Assign the initial value to the current cell
    }
  }
  return resultArray; // Return the fully constructed and initialized 2D array
}

/**
 * Computes the maximum possible score for a given total melody length using a set of available musical phrases.
 * This function employs a dynamic programming strategy, similar to the unbounded knapsack problem.
 *
 * @param {number} totalMelodyLength - The maximum length of the melody for which to calculate the score.
 * @param {Array<Array<number>>} availablePhrases - An array where each element is a phrase represented as [startLength, minLength, score].
 * @returns {Array<Array<number>>} The completed dynamic programming table.
 */
function calculateMaxScore(totalMelodyLength, availablePhrases) {
  var numPhrases = availablePhrases.length; // Get the count of available phrases
  // Initialize the DP table with dimensions (numPhrases + 1) x (totalMelodyLength + 1), filled with zeros.
  var dynamicProgrammingTable = create2DArray(numPhrases + 1, totalMelodyLength + 1, 0);

  var phraseIdx, currentMelodyLen, prevMelodyLen; // Iterators for loops
  var phraseStartLen, phraseMinLen, phraseScore; // Variables to store properties of the current phrase
  var maxPrevScore; // Variable to keep track of the maximum score from previous states

  // Loop through each phrase provided in the input list
  for (phraseIdx = 0; phraseIdx < numPhrases; phraseIdx++) {
    phraseStartLen = availablePhrases[phraseIdx][0]; // Extract the starting length of the current phrase
    phraseMinLen = availablePhrases[phraseIdx][1]; // Extract the minimum length requirement for the current phrase
    phraseScore = availablePhrases[phraseIdx][2]; // Extract the score associated with the current phrase

    // Loop through all possible melody lengths, from 0 up to the maximum total melody length
    for (currentMelodyLen = 0; currentMelodyLen <= totalMelodyLength; currentMelodyLen++) {
      // Check if the current phrase's starting length can be accommodated within the current melody length
      if (phraseStartLen <= currentMelodyLen) {
        maxPrevScore = 0; // Reset the maximum previous score for this specific state

        // Iterate to find the best previous state (prevMelodyLen) that allows adding the current phrase.
        // The range for prevMelodyLen is from (currentMelodyLen - phraseMinLen) to (currentMelodyLen - phraseStartLen).
        // Ensure prevMelodyLen does not go below 0.
        for (prevMelodyLen = phraseMinLen > currentMelodyLen ? 0 : currentMelodyLen - phraseMinLen;
             prevMelodyLen <= currentMelodyLen - phraseStartLen;
             prevMelodyLen++) {
          // Update maxPrevScore if a higher score is found in a previous state
          if (maxPrevScore < dynamicProgrammingTable[phraseIdx + 1][prevMelodyLen]) {
            maxPrevScore = dynamicProgrammingTable[phraseIdx + 1][prevMelodyLen];
          }
        }
        // Update the DP table: choose the maximum between (not using the current phrase)
        // and (using the current phrase + the best score from a compatible previous state).
        dynamicProgrammingTable[phraseIdx + 1][currentMelodyLen] = Math.max(
          dynamicProgrammingTable[phraseIdx][currentMelodyLen],
          maxPrevScore + phraseScore
        );
      } else {
        // If the current phrase cannot fit, simply carry over the value from the previous phrase (without using it).
        dynamicProgrammingTable[phraseIdx + 1][currentMelodyLen] = dynamicProgrammingTable[phraseIdx][currentMelodyLen];
      }
    }
  }
  return dynamicProgrammingTable; // Return the fully populated DP table
}

/**
 * The main function responsible for orchestrating the program's logic:
 * reading input, processing data, performing calculations, and outputting results.
 */
function executeProgram() {
  // Read the first line of input, which specifies the number of phrases, and convert it to a number.
  var numInputPhrases = inputLines.shift() - 0;
  var parsedPhrases = []; // Initialize an array to store the parsed phrase data.

  // Loop to read and parse each phrase from the input lines.
  for (var phraseLoopIdx = 0; phraseLoopIdx < numInputPhrases; phraseLoopIdx++) {
    // Each phrase line is split by space and its parts are converted to numbers.
    parsedPhrases.push(inputLines.shift().split(' ').map(Number));
  }

  // Read the next line of input, which specifies the number of target melody lengths to process.
  var numMelodiesToProcess = inputLines.shift() - 0;
  var targetMelodyLengths = []; // Array to hold the target melody lengths.
  var currentMelodyTarget; // Variable to store the melody length currently being evaluated.
  var finalScores = []; // Array to accumulate the calculated maximum scores for each target melody.
  var melodyLoopIdx; // Loop counter for iterating through target melodies.
  var computedDPTable; // Variable to store the dynamic programming table returned by the calculation function.
  var allMelodiesPossible = true; // A flag to indicate if all target melodies can be formed with a non-zero score.

  // Loop to read each target melody length from the input.
  for (melodyLoopIdx = 0; melodyLoopIdx < numMelodiesToProcess; melodyLoopIdx++) {
    targetMelodyLengths.push(inputLines.shift() - 0); // Add the parsed target length to the list.
  }

  // Call the dynamic programming function to compute the maximum scores.
  // The constant '393' represents the maximum possible melody length considered in the problem.
  computedDPTable = calculateMaxScore(393, parsedPhrases);

  // Iterate through each target melody length to find its corresponding maximum score.
  for (melodyLoopIdx = 0; melodyLoopIdx < numMelodiesToProcess; melodyLoopIdx++) {
    currentMelodyTarget = targetMelodyLengths[melodyLoopIdx]; // Get the current target melody length.

    // Check if the calculated score for the current target melody length is zero.
    // A score of zero implies that the melody cannot be formed with any phrases.
    if (computedDPTable[numInputPhrases][currentMelodyTarget] === 0) {
      allMelodiesPossible = false; // Set the flag to false if any melody cannot be formed.
    } else {
      finalScores.push(computedDPTable[numInputPhrases][currentMelodyTarget]); // Store the valid score.
    }
  }

  // If the flag indicates that not all melodies could be formed, output -1.
  if (!allMelodiesPossible) {
    console.log(-1);
    return; // Terminate the function execution.
  }

  // Otherwise, if all melodies could be formed, output each calculated score on a new line.
  finalScores.forEach(function(scoreItem) {
    console.log(scoreItem);
  });
}
