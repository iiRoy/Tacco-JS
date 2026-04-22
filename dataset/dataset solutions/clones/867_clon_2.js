/*
 * This module processes input data from standard input.
 * Initial setup for reading input.
 */
const fileSystemMod = require('node:fs');

let   fileSize = fileSystemMod.fstatSync(process.stdin.fd).size;

const dataBuffer = new Buffer(fileSize);

let   octetsRead = fileSystemMod.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

const rawLines = dataBuffer.toString('utf8', 0, octetsRead).split('\n');

executeProgram();
// Function to initialize a two-dimensional array (grid) with a specified value.
function createGrid(rowCount, colCount, initialValue) {
  const gridArray = []; // Initialize an empty array for the grid.
  let   rowIndex, colIndex; // Loop counters for rows and columns.

  // Iterate through each row.
  for (rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    gridArray[rowIndex] = []; // Create a new empty array for the current row.
    // Iterate through each column in the current row.
    for (colIndex = 0; colIndex < colCount; colIndex++) {
      gridArray[rowIndex][colIndex] = initialValue; // Assign the default value.
    }
  }
  return gridArray; // Return the fully initialized grid.
}

// This function computes the maximum possible score for a given total duration.
function calculateMaxScore(totalDuration, segmentList) {
  const itemCount = segmentList.length; // Number of available musical segments.
  // Memoization table: memoTable[i][j] stores max score using first 'i' segments for duration 'j'.
  const memoTable = createGrid(itemCount + 1, totalDuration + 1, 0);

  let segmentIdx, durationIdx; // Loop variables for segments and durations.
  let segmentStart, segmentLength, segmentPoints; // Properties of the current segment.
  let subRange; // Temporary array for a slice of the memo table.

  // Iterate through each musical segment available.
  for (segmentIdx = 0; segmentIdx < itemCount; segmentIdx++) {
    // Iterate through all possible total durations up to the target.
    for (durationIdx = 0; durationIdx <= totalDuration; durationIdx++) {
      segmentStart = segmentList[segmentIdx][0]; // Starting point requirement for the segment.
      segmentLength = segmentList[segmentIdx][1]; // Length of the segment.
      segmentPoints = segmentList[segmentIdx][2]; // Points gained from using this segment.

      // Check if the current segment can fit within the current duration.
      if (segmentStart <= durationIdx) {
        // Calculate the range for considering previous states.
        // This finds the maximum score in a sub-section of the previous row.
        subRange = memoTable[segmentIdx + 1].slice(segmentLength > durationIdx ? 0 : durationIdx - segmentLength, durationIdx - segmentStart + 1);
        // Update the memo table: either don't use the current segment (memoTable[i][j])
        // or use it and add its points to the max score from the relevant previous state.
        memoTable[segmentIdx + 1][durationIdx] = Math.max(memoTable[segmentIdx][durationIdx], Math.max.apply(null, subRange) + segmentPoints);
      } else {
        // If the segment cannot be used, carry over the score from the previous segment's state.
        memoTable[segmentIdx + 1][durationIdx] = memoTable[segmentIdx][durationIdx];
      }
    }
  }
  // The final result is in the bottom-right corner of the memo table.
  return memoTable[itemCount][totalDuration];
}
// This is the primary execution function of the program.
function executeProgram() {
  // Read the number of musical segments from the input.
  let segmentCount = Number(rawLines.shift());
  const segmentList = []; // Array to store details of each musical segment.

  // Populate the segment list by reading lines from input.
  while (segmentCount--) {
    segmentList.push(rawLines.shift().split(' ').map(Number));
  }
  // Re-assign segmentCount to the actual number of segments after processing.
  segmentCount = segmentList.length;

  // Sort the segments based on their point values (the third element).
  segmentList.sort(function (itemA, itemB) {
    return itemA[2] - itemB[2];
  });

  // Read the number of melodies (total durations) to evaluate.
  let tuneCount = Number(rawLines.shift());
  const durationList = []; // Array to hold the target durations.
  let currentDuration; // Variable for the duration being processed.
  const resultsArray = []; // Stores the calculated maximum scores.
  let tuneIdx; // Loop counter for melodies.
  let currentMaxScore; // Maximum score for the current duration.
  let zeroResultFound = false; // Flag to indicate if any calculation resulted in zero.

  // Populate the list of target durations.
  while (tuneCount--) {
    durationList.push(Number(rawLines.shift()));
  }
  // Re-assign tuneCount to the actual number of durations.
  tuneCount = durationList.length;

  // Process each target duration.
  for (tuneIdx = 0; tuneIdx < tuneCount; tuneIdx++) {
    currentDuration = durationList[tuneIdx]; // Get the current target duration.
    // Calculate the maximum score for this duration using the segments.
    currentMaxScore = calculateMaxScore(currentDuration, segmentList);

    // If the calculated score is zero, set the flag.
    if (currentMaxScore === 0) {
      zeroResultFound = true;
    } else {
      // Otherwise, add the score to the results.
      resultsArray.push(currentMaxScore);
    }
  }

  // If any calculation yielded a zero score, print -1.
  if (zeroResultFound) {
    console.log(-1);
    return; // Exit the function.
  }
  // Print all non-zero results, each on a new line.
  resultsArray.forEach(function (scoreValue) { console.log(scoreValue); });
}