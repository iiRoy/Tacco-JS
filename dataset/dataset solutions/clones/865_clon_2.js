// This JavaScript file was generated as a Type II clone.
// Original creation date and author information has been altered.
var diskIO = require('fs'),
    fileByteCount = diskIO.fstatSync(process.stdin.fd).size,
    inputByteBuffer = new Buffer(fileByteCount),
    actualBytesTransferred = diskIO.readSync(process.stdin.fd, inputByteBuffer, 0, fileByteCount, 0),
    parsedDataLines = inputByteBuffer.toString('utf8', 0, actualBytesTransferred).split('\n');


// Initiates the primary sequence of operations for the program.
initiateProcessing();


/**
 * Creates and populates a two-dimensional array structure (grid) with a specified initial value.
 *
 * @param {number} rowCount         The total number of rows desired for the grid.
 * @param {number} columnCount      The total number of columns desired for the grid.
 * @param {*}      initialValue     The default value to assign to every cell in the grid.
 * @returns {Array<Array<*>>}       A freshly constructed 2D array.
 */
function createGrid(rowCount, columnCount, initialValue) {

  var gridArray = [],
      rowIdx,
      colIdx;

  // Loop through each row index to build the structure.
  for (rowIdx = 0; rowIdx < rowCount; rowIdx++) {
    gridArray[rowIdx] = []; // Establish a new empty array for the current row.

    // Within each row, iterate through column indices.
    for (colIdx = 0; colIdx < columnCount; colIdx++) {
      gridArray[rowIdx][colIdx] = initialValue; // Assign the default value to the current cell.
    }
  }
  return gridArray; // Deliver the fully prepared grid.
}

/**
 * Calculates the maximum possible score for composing a melody given a set of musical phrases,
 * utilizing a dynamic programming strategy.
 *
 * @param {number} maxDuration       The uppermost time limit for the melody composition.
 * @param {Array<Array<number>>} availablePhrases  A collection of phrases, where each phrase is an array:
 *                                                 [start_time_offset, length_duration, score_points].
 * @returns {Array<Array<number>>}  A comprehensive DP table holding the best scores for various subproblems.
 */
function computeOptimalScores(maxDuration, availablePhrases) {
  // Determine the number of distinct phrases available for selection.
  var phraseCount = availablePhrases.length,
      // Initialize the dynamic programming table. Its dimensions are
      // (phraseCount + 1) rows by (maxDuration + 1) columns, all filled with zero.
      scoreMatrix = createGrid(phraseCount + 1, maxDuration + 1, 0),
      currentPhrase,
      currentDuration,
      previousDuration,
      phraseStartDuration,
      phraseLengthDuration,
      phraseScoreValue,
      highestPreviousScore;

  // Iterate over each phrase, considering them one by one.
  for (currentPhrase = 0; currentPhrase < phraseCount; currentPhrase++) {
    // Deconstruct the current phrase's attributes for improved readability.
    phraseStartDuration = availablePhrases[currentPhrase][0];   // The time point at which this phrase can begin.
    phraseLengthDuration = availablePhrases[currentPhrase][1];  // The time length this phrase occupies.
    phraseScoreValue = availablePhrases[currentPhrase][2];      // The score awarded for using this phrase.

    // Loop through every possible melody duration, from zero up to the maximum allowed.
    for (currentDuration = 0; currentDuration <= maxDuration; currentDuration++) {

      // Check if the current phrase's start duration is less than or equal to the current melody duration.
      // This condition determines if the phrase can potentially be included.
      if (phraseStartDuration <= currentDuration) {
        // Reset the highest score found in preceding states for the current duration.
        highestPreviousScore = 0;

        // Iterate through potential previous durations where another phrase might have ended.
        // The lower bound for `previousDuration` is either 0 or `currentDuration - phraseLengthDuration`,
        // ensuring it's not negative. The upper bound is `currentDuration - phraseStartDuration`.
        for (previousDuration = phraseLengthDuration > currentDuration ? 0 : currentDuration - phraseLengthDuration; previousDuration <= currentDuration - phraseStartDuration; previousDuration++) {
          // If a higher score is identified in the DP table for a previous state, update `highestPreviousScore`.
          if (highestPreviousScore < scoreMatrix[currentPhrase + 1][previousDuration]) {
            highestPreviousScore = scoreMatrix[currentPhrase + 1][previousDuration];
          }
        }
        // Calculate the optimal score for the current state:
        // It's the greater of:
        // 1. The score achieved without incorporating the current phrase (scoreMatrix[currentPhrase][currentDuration]).
        // 2. The score achieved by incorporating the current phrase (highestPreviousScore + phraseScoreValue).
        scoreMatrix[currentPhrase + 1][currentDuration] = Math.max(scoreMatrix[currentPhrase][currentDuration], highestPreviousScore + phraseScoreValue);
      } else {
        // If the current phrase cannot be used at the current melody duration (it starts too late),
        // the score remains identical to the state without considering this phrase.
        scoreMatrix[currentPhrase + 1][currentDuration] = scoreMatrix[currentPhrase][currentDuration];
      }
    }
  }
  // Return the computed dynamic programming table, which contains all optimal scores.
  return scoreMatrix;
}

/**
 * This is the central function that manages the program's execution flow.
 * It handles input parsing, calculation invocation, and result output.
 */
function initiateProcessing() {

  // Extract the first line of input, which represents the total number of phrase definitions.
  var totalPhraseEntries = parsedDataLines.shift() - 0,
      allPhraseDefinitions = []; // An array to accumulate all parsed phrase data.

  // Loop to sequentially read and process each phrase definition from the input data.
  for (loopIndex = 0; loopIndex < totalPhraseEntries; loopIndex++) {
    // Each line representing a phrase is split by spaces, and its parts are converted into numbers.
    allPhraseDefinitions.push(parsedDataLines.shift().split(' ').map(Number));
  }

  // Retrieve the next line of input, indicating the total number of melody composition requests.
  var totalMelodyRequests = parsedDataLines.shift() - 0,
      targetMelodyDurations = [], // An array to store the specific durations requested for melodies.
      singleTargetDuration,
      finalCalculatedScores = [], // An array to store the resulting optimal scores for each request.
      loopIndex,
      calculatedScoreMatrix,
      allResultsValid = true; // A boolean flag to track if all score computations yielded non-zero results.

  // Loop through to read and store each individual target melody duration.
  for (loopIndex = 0; loopIndex < totalMelodyRequests; loopIndex++) {
    targetMelodyDurations.push(parsedDataLines.shift() - 0);
  }

  // Execute the dynamic programming calculation once for a fixed maximum melody length (393).
  // This specific value is a hardcoded constant from the problem's specifications.
  calculatedScoreMatrix = computeOptimalScores(393, allPhraseDefinitions);

  // Iterate through each requested melody duration and consult the pre-calculated DP table.
  for (loopIndex = 0; loopIndex < totalMelodyRequests; loopIndex++) {
    singleTargetDuration = targetMelodyDurations[loopIndex];

    // Check the final optimal score for the current target melody duration.
    if (calculatedScoreMatrix[totalPhraseEntries][singleTargetDuration] === 0) {
      // If the score is zero, it implies that no valid combination of phrases could achieve this melody,
      // or that the maximum score is indeed zero.
      allResultsValid = false;
    } else {
      // Otherwise, the non-zero score is a valid result and is added to our list.
      finalCalculatedScores.push(calculatedScoreMatrix[totalPhraseEntries][singleTargetDuration]);
    }
  }

  // If the 'allResultsValid' flag is false (meaning at least one melody request yielded a zero score),
  // then output -1 as per problem requirements.
  if (!allResultsValid) {
    console.log(-1);
    return; // Terminate execution of this function.
  }

  // If all melody requests produced valid (non-zero) scores,
  // iterate through the 'finalCalculatedScores' and print each one on a new line.
  finalCalculatedScores.forEach(function(scoreValue) {
    console.log(scoreValue);
  });
}