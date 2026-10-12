const fileSystemModule = require('fs'); // Import the Node.js file system module for I/O operations.

// Determine the size of the standard input stream.
const dataLength = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data, initialized with zeros.
const inputBuffer = Buffer.alloc(dataLength);

// Read data from standard input into the buffer, starting from offset 0.
const readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0x0, dataLength, 0x0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
const inputLines = inputBuffer.toString('utf8', 0x0, readBytesCount).split('\n');

// Initiate the main program execution flow.
executeProgram();

/**
 * Generates a two-dimensional array (matrix) with specified dimensions,
 * initializing all its elements to a given value.
 * @param {number} rowsCount - The total number of rows for the matrix.
 * @param {number} colsCount - The total number of columns for the matrix.
 * @param {*} initialValue - The value to assign to each cell in the matrix.
 * @returns {Array<Array<*>>} A newly created 2D array.
 */
function create2DArray(rowsCount, colsCount, initialValue) {
  const resultArray = []; // Declare the array to store rows.
  let rowIndex, colIndex; // Loop counters for rows and columns.

  // Iterate through each row index.
  for (rowIndex = 0x0; rowIndex < rowsCount; rowIndex++) {
    resultArray[rowIndex] = []; // Initialize the current row as an empty array.
    // Iterate through each column index for the current row.
    for (colIndex = 0x0; colIndex < colsCount; colIndex++) {
      resultArray[rowIndex][colIndex] = initialValue; // Assign the specified initial value.
    }
  }
  return resultArray; // Return the fully constructed 2D array.
}

/**
 * Computes the maximum achievable score for a given total melody duration
 * by selecting from a list of musical phrases using dynamic programming.
 * Each phrase has a start time, a length, and associated points.
 * @param {number} totalDuration - The maximum allowed duration for the melody.
 * @param {Array<Array<number>>} segmentList - An array of phrases, where each phrase is [start_time, length, points].
 * @returns {number} The highest possible score.
 */
function calculateMaxScore(totalDuration, segmentList) {
  const numSegments = segmentList.length; // Get the total count of available segments.

  // Initialize the dynamic programming table.
  // dynamicProgrammingTable[i][j] will store the maximum score using the first 'i' segments
  // to achieve a total duration of 'j'.
  const dynamicProgrammingTable = create2DArray(numSegments + 0b1, totalDuration + 0b1, 0x0);

  let segmentIdx, currentDuration; // Iterators for segments and durations.
  let segmentStart, segmentLength, segmentPoints; // Variables to hold properties of the current segment.
  let subArrayRange; // Temporary variable for holding a slice of the DP table.

  // Iterate through each segment available in the list.
  for (segmentIdx = 0x0; segmentIdx < numSegments; segmentIdx++) {
    // Iterate through all possible durations from 0 up to the total allowed duration.
    for (currentDuration = 0x0; currentDuration <= totalDuration; currentDuration++) {
      // Extract the properties of the current segment being considered.
      segmentStart = segmentList[segmentIdx][0x0];
      segmentLength = segmentList[segmentIdx][0b1];
      segmentPoints = segmentList[segmentIdx][0x2];

      // Check if the current segment's start time is within the current duration.
      if (segmentStart <= currentDuration) {
        // Determine the valid range in the previous DP row to find the maximum score
        // that allows adding the current segment.
        // The slice starts from `currentDuration - segmentLength` (or 0 if negative)
        // and ends at `currentDuration - segmentStart + 1` (exclusive).
        subArrayRange = dynamicProgrammingTable[segmentIdx + 0b1].slice(
          segmentLength > currentDuration ? 0x0 : currentDuration - segmentLength,
          currentDuration - segmentStart + 0b1
        );
        // Update the DP table:
        // The maximum score for the current state is either:
        // 1. The score without using the current segment (dynamicProgrammingTable[segmentIdx][currentDuration]).
        // 2. The maximum score from a previous valid state (found in subArrayRange) plus the points of the current segment.
        dynamicProgrammingTable[segmentIdx + 0b1][currentDuration] = Math.max(
          dynamicProgrammingTable[segmentIdx][currentDuration],
          Math.max.apply(void 0, subArrayRange) + segmentPoints
        );
      } else {
        // If the segment's start time is beyond the current duration,
        // this segment cannot be used. The score remains the same as without it.
        dynamicProgrammingTable[segmentIdx + 0b1][currentDuration] = dynamicProgrammingTable[segmentIdx][currentDuration];
      }
    }
  }
  // The final result is stored in the cell corresponding to all segments and the total duration.
  return dynamicProgrammingTable[numSegments][totalDuration];
}

/**
 * The primary function that orchestrates reading input, processing data,
 * performing calculations, and printing the final results.
 */
function executeProgram() {
  // Read the initial count of phrases from the input and convert it to a number.
  let numPhrases = Number(inputLines.shift());
  const phraseDataCollection = []; // Array to store all musical phrase data.

  // Loop to read and parse each phrase from the input.
  while (numPhrases--) {
    phraseDataCollection.push(inputLines.shift().split(' ').map(Number));
  }

  // The actual number of phrases after parsing.
  const actualNumPhrases = phraseDataCollection.length;

  // Sort the phrase data collection based on the points (third element) in ascending order.
  // This sorting might be a prerequisite for the specific dynamic programming approach or for optimization.
  phraseDataCollection.sort(function (phraseA, phraseB) {
    return phraseA[0x2] - phraseB[0x2];
  });

  // Read the number of melody durations to be processed.
  let numMelodies = Number(inputLines.shift());
  const targetMelodyDurations = []; // Array to store the target durations for melodies.
  const finalScores = []; // Array to store the calculated maximum scores for each melody.

  let currentMelodyDuration; // Variable to hold the duration of the melody currently being processed.
  let currentMaxScore; // Variable to hold the maximum score calculated for the current melody.
  let hasZeroScore = !1; // A boolean flag, true if any melody results in a zero score.

  // Loop to read and store each target melody duration.
  while (numMelodies--) {
    targetMelodyDurations.push(Number(inputLines.shift()));
  }

  // The actual number of melodies after parsing.
  const actualNumMelodies = targetMelodyDurations.length;

  // Iterate through each target melody duration to calculate its maximum score.
  for (let melodyIdx = 0x0; melodyIdx < actualNumMelodies; melodyIdx++) {
    currentMelodyDuration = targetMelodyDurations[melodyIdx];

    // Call the dynamic programming function to find the max score for the current melody duration.
    currentMaxScore = calculateMaxScore(currentMelodyDuration, phraseDataCollection);

    // Check if the calculated maximum score is zero.
    if (currentMaxScore === 0x0) {
      hasZeroScore = !0; // Set the flag if a zero score is encountered.
    } else {
      finalScores.push(currentMaxScore); // Add non-zero scores to the results array.
    }
  }

  // If any melody resulted in a zero score, print -1 and terminate the program.
  if (hasZeroScore) {
    console.log(-0b1);
    return; // Exit the function.
  }

  // Otherwise, print each calculated non-zero score on a new line.
  finalScores.forEach(function (scoreValue) {
    console.log(scoreValue);
  });
}
