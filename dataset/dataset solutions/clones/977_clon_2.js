var settings = {
  inputSource: '/dev/stdin', // Specifies the input data source
  lineDelimiter: '\n'        // Defines the character(s) that separate lines
};

// Import the assertion module for validation
const verify = require('assert');

// Read content from the specified input, convert it to ASCII, and divide into individual textual rows
let inputLines = require('fs')
  .readFileSync(settings.inputSource, 'ascii')
  .split(settings.lineDelimiter);

// Process the initial row to extract numerical dimensions for the primary grid
inputLines[0] = inputLines[0]
  .split(' ')
  .map(function(val) { return Number(val); });

let gridHeight = inputLines[0][0]; // Vertical extent of the data grid
let gridWidth = inputLines[0][1];  // Horizontal extent of the data grid

// Extract the actual grid data rows from the input
let mainGrid = inputLines.slice(1, 1 + gridHeight);

// Parse the row immediately following the grid data to get pattern dimensions
inputLines[1 + gridHeight] = inputLines[1 + gridHeight]
  .split(' ')
  .map(function(val) { return Number(val); });

let patternHeight = inputLines[1 + gridHeight][0]; // Vertical extent of the search pattern
let patternWidth = inputLines[1 + gridHeight][1];  // Horizontal extent of the search pattern

// Isolate the search pattern rows
let searchPattern = inputLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternHeight);

inputLines = null; // Explicitly nullify the raw input array to free memory

// If the pattern is larger than the grid in any dimension, exit early as no match is possible
if (gridHeight < patternHeight || gridWidth < patternWidth) {
  process.exit();
}

// Constant defining the fixed length for binary number segments
const BINARY_CHUNK_SIZE = 31;

/**
 * Converts a binary string into a structured object of numerical segments.
 * Each segment is an integer derived from a fixed-length portion of the string.
 * @param {string} binaryString - The input binary string (e.g., "0101101...").
 * @returns {object} An object containing 'totalLength', 'startIndex', and 'dataChunks'.
 */
function createBinaryChunk(binaryString) {
  let chunkArray = [];
  let currentIdx;

  // Iterate and extract fixed-size substrings
  for (currentIdx = 0; currentIdx < binaryString.length; currentIdx += BINARY_CHUNK_SIZE) {
    chunkArray.push(binaryString.substr(currentIdx, BINARY_CHUNK_SIZE));
  }

  // Transform each substring: reverse, join, parse as base-2 integer
  chunkArray = chunkArray.map(function (segmentStr) {
    return parseInt(segmentStr.split('').reverse().join(''), 2);
  });

  // Return a structured representation of the binary string
  return {
    'totalLength': binaryString.length,
    'startIndex': 0,
    'dataChunks': chunkArray
  };
}

/**
 * Checks if one chunk sequence object is a prefix of another (larger) chunk sequence.
 * This comparison considers both full and partial segments.
 * @param {object} fullChunk - The chunk object representing the potentially larger sequence.
 * @param {object} prefixChunk - The chunk object representing the potential prefix.
 * @returns {boolean} True if 'prefixChunk' is a head of 'fullChunk', false otherwise.
 */
function startsWithChunk(fullChunk, prefixChunk) {
  let fullLen, prefixLen, fullOffset, prefixOffset, fullData, prefixData;
  verify(fullChunk.totalLength >= prefixChunk.totalLength); // Sanity check: prefix cannot be longer

  fullLen = fullChunk.totalLength;
  prefixLen = prefixChunk.totalLength;
  fullOffset = fullChunk.startIndex;
  prefixOffset = prefixChunk.startIndex;
  fullData = fullChunk.dataChunks;
  prefixData = prefixChunk.dataChunks;

  // Compare full 31-bit segments until the prefix length is less than a full chunk size
  while (prefixLen > BINARY_CHUNK_SIZE) {
    if (prefixData[prefixOffset] !== fullData[fullOffset]) return false; // Mismatch found
    prefixOffset++;
    fullOffset++;
    prefixLen -= BINARY_CHUNK_SIZE;
    fullLen -= BINARY_CHUNK_SIZE;
  }

  // For the remaining (possibly partial) segment, check if it matches the start of the full chunk's segment
  return ((fullData[fullOffset] % Math.pow(2, prefixLen)) === prefixData[prefixOffset]);
}

/**
 * Modifies a chunk object by moving its effective starting point forward by one `BINARY_CHUNK_SIZE`.
 * @param {object} currentChunk - The chunk object to be advanced.
 * @returns {object|null} The modified chunk object, or null if it has been fully consumed.
 */
function advanceChunk(currentChunk) {
  currentChunk.totalLength -= BINARY_CHUNK_SIZE;
  currentChunk.startIndex++;
  if (currentChunk.totalLength <= 0) {
    return null; // No more meaningful data in this chunk
  }
  return currentChunk;
}

/**
 * Generates an array of chunk objects, where each object represents a segment starting
 * at a different initial offset within the original binary string.
 * @param {string} binaryString - The source binary string.
 * @returns {Array<object>} An array where each element is a chunk object.
 */
function generateChunkSequence(binaryString) {
  let sequenceResult = new Array(BINARY_CHUNK_SIZE);
  let index;

  // Initialize all elements in the result array to null
  for (index = 0; index < BINARY_CHUNK_SIZE; index++) {
    sequenceResult[index] = null;
  }

  // Populate the array with chunk objects, each starting at an increasing offset
  for (index = 0; index < BINARY_CHUNK_SIZE && index < binaryString.length; index++) {
    sequenceResult[index] = createBinaryChunk(binaryString.slice(index));
  }
  return sequenceResult;
}

/**
 * Copies the properties of chunk objects from a source sequence array to a destination array.
 * Performs a shallow copy of the objects themselves, but ensures new objects are created if needed.
 * @param {Array<object>} destination - The array to receive the copied chunk objects.
 * @param {Array<object>} source - The array from which to copy chunk objects.
 */
function duplicateChunkSequence(destination, source) {
  let arrayIndex;
  for (arrayIndex in source) {
    if (!source[arrayIndex]) {
      destination[arrayIndex] = null; // Maintain null placeholders
      continue;
    }
    if (!destination[arrayIndex]) {
      // If destination slot is empty, create a new object and copy properties
      destination[arrayIndex] = Object.assign({}, source[arrayIndex]);
    } else {
      // If destination slot has an object, update its properties
      Object.assign(destination[arrayIndex], source[arrayIndex]);
    }
  }
}

// A global, reusable buffer array for chunk sequence operations to avoid repeated allocations
let tempChunkSequenceBuffer = new Array(BINARY_CHUNK_SIZE);

/**
 * Compares a given target sequence of chunk objects against a single pattern chunk.
 * It iteratively shifts and compares segments within the target sequence.
 * @param {Array<object>} targetSequence - The sequence to be searched.
 * @param {object} patternChunk - The chunk object representing the pattern.
 * @returns {Array<boolean>} An array indicating match outcomes for each comparison.
 */
function compareChunkSequence(targetSequence, patternChunk) {
  let workingSequence = tempChunkSequenceBuffer;
  let comparisonResults = [];
  let currentOffset = 0;

  // Populate the working buffer with a mutable copy of the target sequence
  duplicateChunkSequence(workingSequence, targetSequence);

  // Loop through the working sequence, comparing and advancing segments
  while (workingSequence[currentOffset] && workingSequence[currentOffset].totalLength >= patternChunk.totalLength) {
    comparisonResults.push(startsWithChunk(workingSequence[currentOffset], patternChunk));
    workingSequence[currentOffset] = advanceChunk(workingSequence[currentOffset]);
    currentOffset++;
    // Implement circular access for the buffer
    if (currentOffset === BINARY_CHUNK_SIZE) currentOffset = 0;
  }
  return comparisonResults;
}

// Transform each row of the main grid into a sequence of chunk objects
mainGrid = mainGrid.map(generateChunkSequence);
// Transform each row of the search pattern into a single chunk object
searchPattern = searchPattern.map(createBinaryChunk);

// Initialize a matrix to store potential match counts
let matchMatrix = new Array(gridHeight - patternHeight + 1);
let rowIdx, colIdx; // Iterators for grid dimensions

// Set up the match matrix with zeros
for (rowIdx = 0; rowIdx <= gridHeight - patternHeight; rowIdx++) {
  matchMatrix[rowIdx] = new Array(gridWidth - patternWidth + 1);
  for (colIdx = 0; colIdx <= gridWidth - patternWidth; colIdx++) {
    matchMatrix[rowIdx][colIdx] = 0; // Default to no matches
  }
}

// Execute the core pattern matching logic
for (rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
  for (colIdx = Math.max(0, rowIdx - gridHeight + patternHeight); colIdx < patternHeight && colIdx <= rowIdx; colIdx++) {
    let currentMatches = compareChunkSequence(mainGrid[rowIdx], searchPattern[colIdx]);
    let matchOffset;
    // Iterate through the results of the chunk sequence comparison
    for (matchOffset in currentMatches) {
      if (!currentMatches[matchOffset]) continue; // Only process true matches
      matchMatrix[rowIdx - colIdx][matchOffset]++; // Increment count for this specific match position
    }
  }
}

// Iterate through the completed match matrix and output coordinates of full pattern matches
let finalRow, finalCol;
for (finalRow in matchMatrix) {
  for (finalCol in matchMatrix[finalRow]) {
    if (matchMatrix[finalRow][finalCol] === patternHeight) {
      // If the count equals the pattern's height, a full match is confirmed
      console.log('%s %s', finalRow, finalCol);
    }
  }
}