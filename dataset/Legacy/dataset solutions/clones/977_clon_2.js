// Configuration for input source and newline character
const processingSettings = {
  input: '/dev/stdin', // Standard input for Linux environments
  newline: '\n'        // Newline character for Linux
};

// Import the assertion library for internal checks
const assertionModule = require('assert');

// Read the entire input file, convert to ASCII, and split into lines
let inputLines = require('fs').readFileSync(processingSettings.input, 'ascii')
  .split(processingSettings.newline);

// Parse the first line for grid dimensions
inputLines[0] = inputLines[0].split(' ').map(Number);
let gridHeight = inputLines[0][0]; // Height of the main grid
let gridWidth = inputLines[0][1];  // Width of the main grid

// Extract the main grid data
let mainGrid = inputLines.slice(1, 1 + gridHeight);

// Parse the line after the main grid for pattern dimensions
inputLines[1 + gridHeight] = inputLines[1 + gridHeight].split(' ').map(Number);
let patternHeight = inputLines[1 + gridHeight][0]; // Height of the search pattern
let patternWidth = inputLines[1 + gridHeight][1];  // Width of the search pattern

// Extract the search pattern data
let searchPattern = inputLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternHeight);

// Release memory occupied by raw input lines
inputLines = null;

// Exit if the pattern is larger than the grid in any dimension
if (gridHeight < patternHeight || gridWidth < patternWidth) {
  process.exit();
}

// Define a constant for the length of bit chunks
const CHUNK_BIT_LENGTH = 31;

/**
 * Converts a binary string into a segmented bit chunk object.
 * Each segment stores up to CHUNK_BIT_LENGTH bits as an integer.
 *
 * @param {string} inputString - The binary string to convert.
 * @returns {object} An object representing the bit chunk.
 */
function createBitChunk(inputString) {
  let chunkArray = [];
  let idx;
  // Split the string into segments of CHUNK_BIT_LENGTH
  for (idx = 0; idx < inputString.length; idx += CHUNK_BIT_LENGTH) {
    chunkArray.push(inputString.substr(idx, CHUNK_BIT_LENGTH));
  }
  // Convert each segment from binary string to integer (reversed for easier bitwise operations)
  chunkArray = chunkArray.map(function (binaryStr) {
    return parseInt(binaryStr.split('').reverse().join(''), 2);
  });
  // Return the chunk with its total length, current offset, and bit parts
  return { 'totalBits': inputString.length, 'startOffset': 0, 'bitParts': chunkArray };
}

/**
 * Checks if a smaller bit chunk is a prefix of a larger bit chunk.
 *
 * @param {object} largerChunk - The chunk that might contain the prefix.
 * @param {object} smallerChunk - The chunk to check as a prefix.
 * @returns {boolean} True if smallerChunk is a prefix of largerChunk, false otherwise.
 */
function checkPrefixMatch(largerChunk, smallerChunk) {
  // Ensure the larger chunk is indeed larger or equal in length
  assertionModule(largerChunk.totalBits >= smallerChunk.totalBits);

  let largerLen = largerChunk.totalBits;
  let smallerLen = smallerChunk.totalBits;
  let largerOffset = largerChunk.startOffset;
  let smallerOffset = smallerChunk.startOffset;
  let largerBody = largerChunk.bitParts;
  let smallerBody = smallerChunk.bitParts;

  // Compare full segments until the smaller chunk has less than CHUNK_BIT_LENGTH bits left
  while (smallerLen > CHUNK_BIT_LENGTH) {
    if (smallerBody[smallerOffset] !== largerBody[largerOffset]) {
      return false; // Mismatch found
    }
    smallerOffset++;
    largerOffset++;
    smallerLen -= CHUNK_BIT_LENGTH;
    largerLen -= CHUNK_BIT_LENGTH;
  }
  // Compare the remaining partial segment
  return ((largerBody[largerOffset] % Math.pow(2, smallerLen)) === smallerBody[smallerOffset]);
}

/**
 * Advances a bit chunk by one segment (CHUNK_BIT_LENGTH bits).
 *
 * @param {object} currentChunk - The chunk to advance.
 * @returns {object|null} The advanced chunk or null if no bits remain.
 */
function advanceChunk(currentChunk) {
  currentChunk.totalBits -= CHUNK_BIT_LENGTH;
  currentChunk.startOffset++;
  if (currentChunk.totalBits <= 0) {
    return null; // No bits left in the chunk
  }
  return currentChunk;
}

/**
 * Generates a series of bit chunks from a string, starting at different offsets.
 *
 * @param {string} sourceString - The string to generate chunks from.
 * @returns {Array<object|null>} An array of bit chunk objects.
 */
function generateChunkSeries(sourceString) {
  let resultSeries = new Array(CHUNK_BIT_LENGTH);
  let index;
  // Initialize the array with nulls
  for (index = 0; index < CHUNK_BIT_LENGTH; index++) {
    resultSeries[index] = null;
  }
  // Create a chunk for each possible starting offset within the first CHUNK_BIT_LENGTH characters
  for (index = 0; index < CHUNK_BIT_LENGTH && index < sourceString.length; index++) {
    resultSeries[index] = createBitChunk(sourceString.slice(index));
  }
  return resultSeries;
}

/**
 * Copies properties from a source chunk series to a destination chunk series.
 * Handles creation of new objects if destination elements are null.
 *
 * @param {Array<object|null>} destinationSeries - The series to copy to.
 * @param {Array<object|null>} sourceSeries - The series to copy from.
 */
function replicateChunkSeries(destinationSeries, sourceSeries) {
  let seriesIndex;
  for (seriesIndex in sourceSeries) {
    if (!sourceSeries[seriesIndex]) {
      destinationSeries[seriesIndex] = null;
      continue;
    }
    if (!destinationSeries[seriesIndex]) {
      // If destination element is null, create a new object
      destinationSeries[seriesIndex] = Object.assign({}, sourceSeries[seriesIndex]);
    } else {
      // Otherwise, update existing object
      Object.assign(destinationSeries[seriesIndex], sourceSeries[seriesIndex]);
    }
  }
}

// Global temporary array used to avoid repeated allocations in segmentMatch
let tempChunkSeriesForMatch = new Array(CHUNK_BIT_LENGTH);

/**
 * Performs a match operation between a series of chunks and a single pattern chunk.
 *
 * @param {Array<object|null>} targetSeries - The series of chunks to search within.
 * @param {object} patternChunk - The single chunk representing the pattern.
 * @returns {Array<boolean>} An array indicating match results for each position.
 */
function performChunkMatch(targetSeries, patternChunk) {
  let workingSeries = tempChunkSeriesForMatch;
  replicateChunkSeries(workingSeries, targetSeries); // Copy to temporary working series
  let matchResults = [];
  let loopCounter = 0;
  // Iterate through the working series, checking for matches and advancing chunks
  while (workingSeries[loopCounter] && workingSeries[loopCounter].totalBits >= patternChunk.totalBits) {
    matchResults.push(checkPrefixMatch(workingSeries[loopCounter], patternChunk));
    workingSeries[loopCounter] = advanceChunk(workingSeries[loopCounter]);
    loopCounter++;
    if (loopCounter === CHUNK_BIT_LENGTH) {
      loopCounter = 0; // Wrap around for circular access
    }
  }
  return matchResults;
}

// Pre-process the main grid and search pattern into bit chunk representations
mainGrid = mainGrid.map(generateChunkSeries);
searchPattern = searchPattern.map(createBitChunk);

// Initialize a matrix to store match counts
let matchCountMatrix = new Array(gridHeight - patternHeight + 1);
let rowIdx, colIdx;
for (rowIdx = 0; rowIdx <= gridHeight - patternHeight; rowIdx++) {
  matchCountMatrix[rowIdx] = new Array(gridWidth - patternWidth + 1);
  for (colIdx = 0; colIdx <= gridWidth - patternWidth; colIdx++) {
    matchCountMatrix[rowIdx][colIdx] = 0; // Initialize all counts to zero
  }
}

// Perform the pattern matching
for (rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
  // The inner loop iterates through relevant pattern rows
  for (colIdx = Math.max(0, rowIdx - gridHeight + patternHeight); colIdx < patternHeight && colIdx <= rowIdx; colIdx++) {
    // Perform chunk matching for the current grid row and pattern row
    let currentMatches = performChunkMatch(mainGrid[rowIdx], searchPattern[colIdx]);
    let matchIdx;
    // Update the match count matrix based on the results
    for (matchIdx in currentMatches) {
      if (!currentMatches[matchIdx]) {
        continue; // Skip if no match at this position
      }
      // Increment the count for the corresponding top-left corner of the pattern
      matchCountMatrix[rowIdx - colIdx][matchIdx]++;
    }
  }
}

// Output the coordinates where the pattern fully matches
for (rowIdx in matchCountMatrix) {
  for (colIdx in matchCountMatrix[rowIdx]) {
    if (matchCountMatrix[rowIdx][colIdx] === patternHeight) {
      console.log('%s %s', rowIdx, colIdx); // Print the (row, column) of the match
    }
  }
}
