const fileSystemModule = require('fs'); // Import the Node.js file system module.

// Determine the size of the standard input stream's file descriptor.
const dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to store the incoming data from standard input.
const inputBuffer = new Buffer(dataSize);

// Read the data from standard input into the allocated buffer.
const readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
const rawInputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Initiate the primary execution flow of the program.
executeProgram();

/**
 * Creates and initializes a two-dimensional array (matrix) with a specified value.
 * @param {number} rowsCount - The total number of rows for the new matrix.
 * @param {number} colsCount - The total number of columns for each row in the matrix.
 * @param {*} initialValue - The value to assign to every cell in the matrix upon creation.
 * @returns {Array<Array<*>>} A newly constructed 2D array.
 */
function create2DArray(rowsCount, colsCount, initialValue) {
  let resultArray = []; // Declare the array that will hold the rows.
  let rowIndex, colIndex; // Loop iterators for rows and columns.

  // Iterate through each row index.
  for (rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    resultArray[rowIndex] = []; // Initialize the current row as an empty array.
    // Iterate through each column index for the current row.
    for (colIndex = 0; colIndex < colsCount; colIndex++) {
      resultArray[rowIndex][colIndex] = initialValue; // Assign the initial value to the current cell.
    }
  }
  return resultArray; // Return the fully populated 2D array.
}

/**
 * Computes the maximum possible score for a given total melody duration
 * by selecting from a list of available musical segments.
 * This function employs a dynamic programming approach.
 * @param {number} totalDuration - The target total duration for the melody.
 * @param {Array<Array<number>>} segmentOptions - An array where each element is a segment
 *                                                defined by [start_time, length, points].
 * @returns {number} The highest score achievable for the specified total duration.
 */
function calculateMaxScore(totalDuration, segmentOptions) {
  const numOptions = segmentOptions.length; // Get the total number of segment options.
  // Initialize the dynamic programming table. It will have (numOptions + 1) rows
  // and (totalDuration + 1) columns, all initialized to 0.
  const dynamicProgrammingTable = create2DArray(numOptions + 1, totalDuration + 1, 0);

  let optionIdx, currentDuration, prevDurationIdx; // Iterators for loops.
  let segmentStart, segmentLength, segmentPoints; // Variables to hold properties of the current segment.
  let maxPrevScore; // Variable to track the maximum score from previous states.

  // Iterate over each segment option available.
  for (optionIdx = 0; optionIdx < numOptions; optionIdx++) {
    // Iterate over each possible duration from 0 up to the total target duration.
    for (currentDuration = 0; currentDuration <= totalDuration; currentDuration++) {
      // Extract the properties of the current segment option.
      segmentStart = segmentOptions[optionIdx][0];
      segmentLength = segmentOptions[optionIdx][1];
      segmentPoints = segmentOptions[optionIdx][2];

      // Check if the current segment's start time is less than or equal to the current duration.
      if (segmentStart <= currentDuration) {
        maxPrevScore = 0; // Reset the maximum previous score for this state.
        // Determine the starting index for the inner loop, ensuring it doesn't go below 0.
        const loopStart = segmentLength > currentDuration ? 0 : currentDuration - segmentLength;

        // Iterate through possible previous durations to find the best score.
        for (prevDurationIdx = loopStart; prevDurationIdx <= currentDuration - segmentStart; prevDurationIdx++) {
          // Update maxPrevScore if a higher score is found in the DP table from the previous row.
          if (maxPrevScore < dynamicProgrammingTable[optionIdx + 1][prevDurationIdx]) {
            maxPrevScore = dynamicProgrammingTable[optionIdx + 1][prevDurationIdx];
          }
        }
        // Update the DP table: take the maximum of (not using the current segment)
        // or (using the current segment plus the best score from previous states).
        dynamicProgrammingTable[optionIdx + 1][currentDuration] = Math.max(
          dynamicProgrammingTable[optionIdx][currentDuration],
          maxPrevScore + segmentPoints
        );
      } else {
        // If the segment cannot be placed (its start time is too late),
        // simply carry over the value from the previous row (without considering this segment).
        dynamicProgrammingTable[optionIdx + 1][currentDuration] = dynamicProgrammingTable[optionIdx][currentDuration];
      }
    }
  }
  // The final maximum score for the total duration is found at the bottom-right cell of the DP table.
  return dynamicProgrammingTable[numOptions][totalDuration];
}

/**
 * The main function that orchestrates the program's logic.
 * It reads input, processes melody calculations, and outputs the results.
 */
function executeProgram() {
  // Read the first line of input, which specifies the number of phrases, and convert it to a number.
  const numPhrases = rawInputLines.shift() - 0;
  const phraseDefinitions = []; // Initialize an array to store the definitions of musical phrases.

  // Loop to read and parse each phrase definition from the input.
  for (let phraseIndex = 0; phraseIndex < numPhrases; phraseIndex++) {
    // Each phrase line is split by space and mapped to numbers, then added to the array.
    phraseDefinitions.push(rawInputLines.shift().split(' ').map(Number));
  }

  // Read the next line of input, which specifies the number of melodies to evaluate.
  const numMelodies = rawInputLines.shift() - 0;
  const targetMelodies = []; // Array to hold the target durations for each melody.
  const finalScores = []; // Array to store the computed scores for each melody.

  let currentMelodyTarget; // Variable to store the duration of the melody currently being processed.
  let computedScore; // Variable to store the score returned by the calculation function.
  let allMelodiesSolvable = true; // A flag to indicate if all melodies resulted in a non-zero score.

  // Loop to read each target melody duration from the input.
  for (let melodyIndex = 0; melodyIndex < numMelodies; melodyIndex++) {
    targetMelodies.push(rawInputLines.shift() - 0); // Convert and add the duration to the list.
  }

  // Loop through each target melody duration to calculate its maximum score.
  for (let melodyProcessIndex = 0; melodyProcessIndex < numMelodies; melodyProcessIndex++) {
    currentMelodyTarget = targetMelodies[melodyProcessIndex]; // Get the current melody's target duration.
    // Call the solver function to calculate the maximum score for this melody.
    computedScore = calculateMaxScore(currentMelodyTarget, phraseDefinitions);

    // Check if the computed score is zero.
    if (computedScore === 0) {
      allMelodiesSolvable = false; // If any melody yields a zero score, set the flag to false.
    } else {
      finalScores.push(computedScore); // Otherwise, add the valid score to the results array.
    }
  }

  // After processing all melodies, check the flag.
  if (!allMelodiesSolvable) {
    console.log(-1); // If any melody was unsolvable (score 0), print -1.
    return; // Terminate the function.
  }

  // If all melodies were solvable, print each calculated score on a new line.
  finalScores.forEach(function(scoreValue) {
    console.log(scoreValue);
  });
}
