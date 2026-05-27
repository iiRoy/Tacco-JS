const fileSystemModule = require('fs'); // Import the Node.js file system module.

// Determine the size of the standard input stream in bytes.
let dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a new Buffer of the determined size to hold the input data.
let inputBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer.
// Parameters: file descriptor, buffer, offset in buffer, number of bytes to read, position in file.
let readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
let parsedInputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Initiate the primary execution flow of the program.
executeProgram();

/**
 * Generates a two-dimensional array (matrix) and initializes all its cells.
 * @param {number} rowsCount - The desired number of rows for the matrix.
 * @param {number} colsCount - The desired number of columns for the matrix.
 * @param {*} initialValue - The value to assign to each cell in the matrix.
 * @returns {Array<Array<*>>} A newly created 2D array.
 */
function create2DArray(rowsCount, colsCount, initialValue) {
  const resultArray = []; // This array will store the rows of our matrix.
  let rowIndex, colIndex; // Loop counters for iterating through rows and columns.

  // Loop through each row index.
  for (rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    resultArray[rowIndex] = []; // Initialize the current row as an empty array.
    // Loop through each column index for the current row.
    for (colIndex = 0; colIndex < colsCount; colIndex++) {
      resultArray[rowIndex][colIndex] = initialValue; // Assign the specified initial value to the cell.
    }
  }
  return resultArray; // Return the fully constructed and initialized 2D array.
}

/**
 * Computes the maximum score achievable for a given melody length using a set of available phrases.
 * This function employs a dynamic programming approach.
 * @param {number} targetMelodyLength - The total length of the melody for which to calculate the maximum score.
 * @param {Array<Array<number>>} availablePhrases - A collection of phrases, where each phrase is an array
 *                                                  [start_position, duration, points].
 * @returns {number} The highest possible score for the specified melody length.
 */
function calculateMaxScore(targetMelodyLength, availablePhrases) {
  // Determine the total number of phrases provided.
  const phraseCount = availablePhrases.length;

  // Initialize the dynamic programming table.
  // `dynamicProgrammingTable[i][j]` will store the maximum score using the first `i` phrases
  // to achieve a melody of length `j`.
  const dynamicProgrammingTable = create2DArray(phraseCount + 1, targetMelodyLength + 1, 0);

  let phraseIndex, currentMelodyPosition; // Iterators for loops.
  let phraseStart, phraseDuration, phrasePoints; // Variables to hold properties of the current phrase.
  let relevantRange; // Temporary variable to store a slice of the DP table.

  // Iterate through each phrase, from the first to the last.
  for (phraseIndex = 0; phraseIndex < phraseCount; phraseIndex++) {
    // Iterate through all possible melody lengths, from 0 up to the target length.
    for (currentMelodyPosition = 0; currentMelodyPosition <= targetMelodyLength; currentMelodyPosition++) {
      // Extract the properties of the current phrase being considered.
      phraseStart = availablePhrases[phraseIndex][0]; // The starting point requirement for the phrase.
      phraseDuration = availablePhrases[phraseIndex][1]; // The length or duration of the phrase.
      phrasePoints = availablePhrases[phraseIndex][2]; // The score awarded for using this phrase.

      // Check if the current phrase can be placed such that its start position
      // is less than or equal to the current melody position.
      if (phraseStart <= currentMelodyPosition) {
        // Calculate the starting index for the slice from the previous row of the DP table.
        // This determines the earliest point from which the current phrase could extend.
        const sliceStartIndex = (phraseDuration > currentMelodyPosition) ? 0 : currentMelodyPosition - phraseDuration;

        // Calculate the ending index (exclusive) for the slice.
        // This represents the latest melody position *before* the current phrase starts.
        const sliceEndIndex = currentMelodyPosition - phraseStart + 1;

        // Extract a slice from the DP table's previous row.
        // This slice contains all possible maximum scores from which the current phrase could be appended.
        relevantRange = dynamicProgrammingTable[phraseIndex + 1].slice(sliceStartIndex, sliceEndIndex);

        // Update the current cell in the DP table.
        // The value is the maximum of:
        // 1. The score achieved without using the current phrase (from the previous row, same column).
        // 2. The maximum score found within the `relevantRange` (meaning, using a previous combination
        //    that allows the current phrase to fit) plus the points of the current phrase.
        dynamicProgrammingTable[phraseIndex + 1][currentMelodyPosition] = Math.max(
          dynamicProgrammingTable[phraseIndex][currentMelodyPosition],
          Math.max.apply(null, relevantRange) + phrasePoints
        );
      } else {
        // If the current phrase cannot be placed at the current melody position (its start is too late),
        // the score for this cell is simply carried over from the previous row (without using this phrase).
        dynamicProgrammingTable[phraseIndex + 1][currentMelodyPosition] = dynamicProgrammingTable[phraseIndex][currentMelodyPosition];
      }
    }
  }

  // The final maximum score for the target melody length, considering all phrases,
  // is located at the bottom-right corner of the DP table.
  return dynamicProgrammingTable[phraseCount][targetMelodyLength];
}

/**
 * The main entry point of the program.
 * It orchestrates reading input, processing phrases and melody requests,
 * and outputting the calculated scores.
 */
function executeProgram() {
  // Read the first line of input, which specifies the number of phrases, and convert it to a number.
  const numPhrases = parsedInputLines.shift() - 0;
  const allPhrases = []; // An array to store all the parsed phrase data.

  let loopCounterA, loopCounterB, loopCounterC; // Generic loop counters, matching original declaration style.

  // Loop to read and parse each phrase from the input lines.
  for (loopCounterA = 0; loopCounterA < numPhrases; loopCounterA++) {
    // Read a line, split it by spaces, and convert each part to a number, then add to allPhrases.
    allPhrases.push(parsedInputLines.shift().split(' ').map(Number));
  }

  // Read the next line of input, which specifies the number of melodies to evaluate.
  const numMelodies = parsedInputLines.shift() - 0;
  const targetMelodyLengths = []; // An array to store the target lengths for each melody.

  let currentMelodyLength; // Variable to hold the length of the melody currently being processed.
  let currentMaxScore; // Variable to store the result from `calculateMaxScore`.
  const finalScores = []; // An array to accumulate the scores for solvable melodies.
  let allMelodiesSolvable = true; // A boolean flag to track if all melodies can achieve a non-zero score.

  // Loop to read each target melody length from the input.
  for (loopCounterA = 0; loopCounterA < numMelodies; loopCounterA++) {
    targetMelodyLengths.push(parsedInputLines.shift() - 0); // Convert to number and add to the list.
  }

  // Iterate through each target melody length to calculate its maximum score.
  for (loopCounterA = 0; loopCounterA < numMelodies; loopCounterA++) {
    currentMelodyLength = targetMelodyLengths[loopCounterA]; // Get the current melody length.

    // Call the dynamic programming function to find the maximum score.
    currentMaxScore = calculateMaxScore(currentMelodyLength, allPhrases);

    // If the calculated maximum score is 0, it implies this melody cannot be formed
    // with any positive score using the given phrases.
    if (currentMaxScore === 0) {
      allMelodiesSolvable = false; // Set the flag to indicate at least one melody is unsolvable.
    } else {
      finalScores.push(currentMaxScore); // Otherwise, add the positive score to our results.
    }
  }

  // After processing all melodies, check the solvability flag.
  if (!allMelodiesSolvable) {
    console.log(-1); // If any melody was unsolvable, print -1 as per problem requirements.
    return; // Exit the function.
  }

  // If all melodies were solvable, print each calculated score on a new line.
  finalScores.forEach(function(scoreValue) {
    console.log(scoreValue);
  });
}
