// Configuration for input processing.
// This object holds settings like the input source and line termination character.
options = { sourcePath: '/dev/stdin', lineTerminator: '\n' };

// Load the assertion utility; useful for internal checks.
const verifier = require('assert');

// Read the entire input file, then split it into individual lines.
// The 'ascii' encoding is used for raw character processing.
rawInput = require('fs').readFileSync(options.sourcePath, 'ascii')
  .split(options.lineTerminator);

// The first line contains grid dimensions. Parse them into numbers.
rawInput[0] = rawInput[0].split(' ').map(Number);
mainHeight = rawInput[0][0]; // Height of the primary grid
mainWidth = rawInput[0][1];   // Width of the primary grid

// Extract the primary grid data.
primaryMap = rawInput.slice(1, 1 + mainHeight);

// The line immediately following the primary grid contains pattern dimensions.
rawInput[1 + mainHeight] = rawInput[1 + mainHeight].split(' ').map(Number);
subHeight = rawInput[1 + mainHeight][0]; // Height of the sub-pattern
subWidth = rawInput[1 + mainHeight][1];   // Width of the sub-pattern

// Extract the sub-pattern data.
templateGrid = rawInput.slice(1 + mainHeight + 1, 1 + mainHeight + 1 + subHeight);

// Release memory used by raw input lines, as they are no longer needed.
rawInput = null;

// If the sub-pattern is larger than the primary grid in any dimension,
// no match is possible, so terminate execution early.
if (mainHeight < subHeight || mainWidth < subWidth) process.exit();

// A constant defining the length of each binary segment/chunk in bits.
// This value is crucial for efficient bitwise operations.
const PARTITION_BIT_COUNT = 30;

/**
 * Converts a binary string into an array of integer chunks.
 * Each chunk represents a PARTITION_BIT_COUNT-bit segment of the reversed string.
 *
 * @param {string} inputSequence - The binary string to convert.
 * @returns {object} An object containing the original length, current offset, and chunk array.
 */
function createBinaryChunk(inputSequence) {
  let chunkList = [];
  let charIndex;
  // Iterate through the input string, segmenting it into fixed-size pieces.
  for (charIndex = 0; charIndex < inputSequence.length; charIndex += PARTITION_BIT_COUNT) {
    chunkList.push(inputSequence.substring(charIndex, PARTITION_BIT_COUNT));
  }
  // For each chunk, reverse it (for little-endian interpretation) and parse as a binary integer.
  chunkList = chunkList.map(function (segmentPart) {
    return parseInt(segmentPart.split('').reverse().join(''), 2);
  });
  return { 'totalLength': inputSequence.length, 'currentOffset': 0, 'dataBlocks': chunkList };
}

/**
 * Checks if a smaller chunk is a prefix of a larger chunk.
 * This comparison is done segment by segment, then bit by bit for the final segment.
 *
 * @param {object} largerChunk - The chunk representing the potential longer string.
 * @param {object} smallerChunk - The chunk representing the potential shorter prefix.
 * @returns {boolean} True if smallerChunk is a prefix of largerChunk, false otherwise.
 */
function prefixMatch(largerChunk, smallerChunk) {
  // Ensure the logical length of the larger chunk is indeed greater or equal.
  verifier(largerChunk.totalLength >= smallerChunk.totalLength);

  let mainLength = largerChunk.totalLength;
  let subLength = smallerChunk.totalLength;
  let mainOffset = largerChunk.currentOffset;
  let subOffset = smallerChunk.currentOffset;
  let mainBody = largerChunk.dataBlocks;
  let subBody = smallerChunk.dataBlocks;

  // Compare full segments until the smaller chunk's remaining length is less than PARTITION_BIT_COUNT.
  while (subLength > PARTITION_BIT_COUNT) {
    if (subBody[subOffset] !== mainBody[mainOffset]) return false;
    subOffset++;
    mainOffset++;
    subLength -= PARTITION_BIT_COUNT;
    mainLength -= PARTITION_BIT_COUNT;
  }
  // For the final (potentially partial) segment, perform a bitwise comparison.
  // This checks if the least significant 'subLength' bits match.
  return (mainBody[mainOffset] % (1 << subLength) === subBody[subOffset]);
}

/**
 * Advances the pointer of a chunk, effectively "shifting" it by one segment.
 *
 * @param {object} activePartition - The chunk object to be shifted.
 * @returns {object|null} The modified chunk object, or null if it becomes empty.
 */
function advanceChunkPointer(activePartition) {
  activePartition.totalLength -= PARTITION_BIT_COUNT;
  activePartition.currentOffset++;
  // If the chunk's length becomes zero or negative, it's exhausted.
  if (activePartition.totalLength <= 0) return null;
  return activePartition;
}

/**
 * Generates a series of chunk objects from an input string,
 * each starting at a different offset up to PARTITION_BIT_COUNT.
 *
 * @param {string} inputSequence - The string from which to generate chunk series.
 * @returns {Array<object|null>} An array of chunk objects, some might be null if string is too short.
 */
function buildPartitionCollection(inputSequence) {
  let sequenceContainer = new Array(PARTITION_BIT_COUNT);
  let elementIndex;
  // Initialize the array with nulls.
  for (elementIndex = 0; elementIndex < PARTITION_BIT_COUNT; elementIndex++) {
    sequenceContainer[elementIndex] = null;
  }
  // For each possible starting bit position within a segment, create a new chunk.
  for (elementIndex = 0;
    elementIndex < PARTITION_BIT_COUNT && elementIndex < inputSequence.length;
    elementIndex++) {
    sequenceContainer[elementIndex] = createBinaryChunk(inputSequence.substring(elementIndex));
  }
  return sequenceContainer;
}

/**
 * Deep copies a source chunk sequence into a destination chunk sequence.
 * This is necessary to avoid modifying shared references during matching operations.
 *
 * @param {Array<object|null>} destination - The array to copy into.
 * @param {Array<object|null>} source - The array to copy from.
 */
function replicatePartitionCollection(destination, source) {
  let srcIdx, destIdx, sourceItem, destinationItem;
  // Iterate over each item in the source array.
  for (srcIdx in source) {
    sourceItem = source[srcIdx];
    // If the source item is null, set the corresponding destination item to null.
    if (!sourceItem) {
      destination[srcIdx] = null;
      continue;
    }
    // Get or create the destination item.
    destinationItem = destination[srcIdx];
    if (!destinationItem) destinationItem = {};

    // Copy properties from source item to destination item.
    // This effectively performs a shallow copy of the object's properties.
    for (destIdx in sourceItem) destinationItem[destIdx] = sourceItem[destIdx];
    destination[srcIdx] = destinationItem;
  }
}

// A temporary buffer used during pattern matching to store and manipulate chunk sequences.
// Initialized to the maximum segment bit count.
matchPartitionCache = new Array(PARTITION_BIT_COUNT);

/**
 * Performs a pattern match operation between a chunk sequence and a single chunk.
 * It iterates through the sequence, checking for prefixes and advancing the sequence.
 *
 * @param {Array<object|null>} mainSequence - The sequence of chunks to search within.
 * @param {object} subChunk - The single chunk representing the pattern to find.
 * @returns {Array<boolean>} An array of boolean results indicating matches at each offset.
 */
function findChunkMatches(mainSequence, subChunk) {
  let workingSequence = matchPartitionCache; // Use the global buffer.
  replicatePartitionCollection(workingSequence, mainSequence); // Populate buffer with a copy.

  let comparisonResults = [];
  let currentOffset = 0;

  // Continue as long as there are valid chunks in the sequence
  // and the current chunk is long enough to contain the sub-chunk.
  while (workingSequence[currentOffset] &&
    workingSequence[currentOffset].totalLength >= subChunk.totalLength) {
    // Perform the prefix match and store the result.
    comparisonResults.push(prefixMatch(workingSequence[currentOffset], subChunk));
    // Advance the current chunk in the sequence.
    workingSequence[currentOffset] = advanceChunkPointer(workingSequence[currentOffset]);
    currentOffset++;
    // Wrap around if the index reaches the end of the buffer.
    if (currentOffset === PARTITION_BIT_COUNT) currentOffset = 0;
  }
  return comparisonResults;
}

// Pre-process the primary grid and the sub-pattern into segment/chunk representations.
primaryMap = primaryMap.map(buildPartitionCollection); // Each row becomes a series of chunks.
templateGrid = templateGrid.map(createBinaryChunk);   // Each pattern row becomes a single chunk.

// Initialize a 2D array to store the counts of pattern matches.
// Dimensions are (mainHeight - subHeight + 1) by (mainWidth - subWidth + 1).
let occurrenceGrid = new Array(mainHeight - subHeight + 1);
let outerIndex;
let innerIndex;

for (outerIndex = 0; outerIndex <= mainHeight - subHeight; outerIndex++) {
  occurrenceGrid[outerIndex] = new Array(mainWidth - subWidth + 1);
  for (innerIndex = 0; innerIndex <= mainWidth - subWidth; innerIndex++) {
    occurrenceGrid[outerIndex][innerIndex] = 0; // Initialize all counts to zero.
  }
}

// Main pattern matching loop.
// Iterates through the primary map and attempts to match rows of the template grid.
for (outerIndex = 0; outerIndex < mainHeight; outerIndex++) {
  // The inner loop iterates over possible pattern rows that could align with the current primary map row.
  // The 'Math.max' ensures we don't try to match pattern rows that would extend above the current primary row.
  for (innerIndex = Math.max(0, outerIndex - mainHeight + subHeight);
    innerIndex < subHeight && innerIndex <= outerIndex;
    innerIndex++) {

    // Find all matches for the current primary map row (outerIndex)
    // against the current pattern row (innerIndex).
    let currentComparisonResults = findChunkMatches(primaryMap[outerIndex], templateGrid[innerIndex]);

    // Update the occurrence grid based on the comparison results.
    let resultKey;
    for (resultKey in currentComparisonResults) {
      if (!currentComparisonResults[resultKey]) continue; // Only count successful matches.
      occurrenceGrid[outerIndex - innerIndex][resultKey]++; // Increment count for the specific (row, col) offset.
    }
  }
}

// After all comparisons, iterate through the occurrence grid.
// If a cell's count equals the sub-pattern's height, it means all rows matched at that position.
// Print the coordinates (row, column) of such full matches.
for (outerIndex in occurrenceGrid) {
  for (innerIndex in occurrenceGrid[outerIndex]) {
    if (occurrenceGrid[outerIndex][innerIndex] === subHeight) {
      console.log('%s %s', outerIndex, innerIndex);
    }
  }
}