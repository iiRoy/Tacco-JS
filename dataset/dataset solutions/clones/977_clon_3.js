const fileSystemHandler = require('fs');

// System configuration for input/output handling
const systemConfig = {
  inputStream: '/dev/stdin', // Default to Linux standard input
  lineDelimiter: '\n'         // Default to Unix-style newline
};

// Guard clause for invalid dimensions early
const validateInputDimensions = (height, width, patternHeight, patternWidth) => {
  if (height <= 0 || width <= 0 || patternHeight <= 0 || patternWidth <= 0) {
    console.error("Error: Grid or pattern dimensions must be positive integers.");
    process.exit(1);
  }
  if (height < patternHeight || width < patternWidth) {
    // No match possible if pattern is larger than grid
    process.exit(0); // Exit gracefully, as per original logic (no output expected)
  }
};

// Constant for the maximum length of a binary segment that can be safely parsed as an integer.
// This is related to JavaScript's Number type precision for bitwise operations and parseInt.
const BINARY_SEGMENT_CHUNK_SIZE = 31;

// Helper function to read and parse initial dimensions
const parseDimensions = (dimensionString) => {
  const parts = dimensionString.split(' ').map(Number.parseInt);
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    console.error("Error: Invalid dimension format. Expected two numbers separated by space.");
    process.exit(1);
  }
  return { height: parts[0], width: parts[1] };
};

// Read all input data at once
const rawInputLines = fileSystemHandler.readFileSync(systemConfig.inputStream, 'ascii')
  .split(systemConfig.lineDelimiter);

// Parse grid dimensions
const gridDimensions = parseDimensions(rawInputLines[0]);
let gridHeight = gridDimensions.height;
let gridWidth = gridDimensions.width;

// Extract grid data (the 'field')
const gridDataRows = rawInputLines.slice(1, 1 + gridHeight);

// Parse pattern dimensions
const patternDimensions = parseDimensions(rawInputLines[1 + gridHeight]);
let patternHeight = patternDimensions.height;
let patternWidth = patternDimensions.width;

// Extract pattern data
const patternDataRows = rawInputLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternHeight);

// Validate dimensions before proceeding
validateInputDimensions(gridHeight, gridWidth, patternHeight, patternWidth);

// Represents a numerical segment of a binary string for efficient comparison.
// Stores length, current offset into the `body` array, and the array of parsed integers.
class BinarySegment {
  constructor(totalLength, currentOffset, numericalBody) {
    this.totalLength = totalLength;
    this.currentOffset = currentOffset;
    this.numericalBody = numericalBody;
  }

  // Creates a new BinarySegment instance from a string.
  static fromString(inputString) {
    const segmentArray = [];
    for (let currentIdx = 0; currentIdx < inputString.length; currentIdx += BINARY_SEGMENT_CHUNK_SIZE) {
      const chunk = inputString.substring(currentIdx, currentIdx + BINARY_SEGMENT_CHUNK_SIZE);
      // Reverse the chunk to handle least significant bits first when parsing,
      // which simplifies bitwise comparison when shifting.
      const reversedChunk = [...chunk].reverse().join('');
      segmentArray.push(Number.parseInt(reversedChunk, 2));
    }
    return new BinarySegment(inputString.length, 0, segmentArray);
  }

  // Shifts the segment window forward by one chunk.
  // Returns null if the segment becomes empty after shifting.
  shiftWindow() {
    this.totalLength -= BINARY_SEGMENT_CHUNK_SIZE;
    this.currentOffset++;
    return (this.totalLength <= 0) ? null : this;
  }
}

// Determines if a shorter binary segment is a prefix of a longer one.
// Both segments are represented by BinarySegment objects.
const isPrefixMatch = (superSegment, subSegment) => {
  // Basic validation
  if (!superSegment || !subSegment || superSegment.totalLength < subSegment.totalLength) {
    return false; // Or throw an error, depending on desired robustness
  }

  let currentSuperLength = superSegment.totalLength;
  let currentSubLength = subSegment.totalLength;
  let superOffset = superSegment.currentOffset;
  let subOffset = subSegment.currentOffset;

  const superBody = superSegment.numericalBody;
  const subBody = subSegment.numericalBody;

  // Compare full chunks
  while (currentSubLength > BINARY_SEGMENT_CHUNK_SIZE) {
    if (superOffset >= superBody.length || subOffset >= subBody.length || superBody[superOffset] !== subBody[subOffset]) {
      return false;
    }
    superOffset++;
    subOffset++;
    currentSubLength -= BINARY_SEGMENT_CHUNK_SIZE;
    currentSuperLength -= BINARY_SEGMENT_CHUNK_SIZE; // Not strictly needed for logic, but for conceptual consistency
  }

  // Compare the remaining partial chunk
  if (subOffset >= subBody.length || superOffset >= superBody.length) {
    // This case should ideally not be hit if subSegment is valid and shorter.
    // It indicates an issue with segment construction or currentOffset.
    return false;
  }

  const mask = (1 << currentSubLength) - 1; // Equivalent to Math.pow(2, currentSubLength) - 1
  return (superBody[superOffset] & mask) === (subBody[subOffset] & mask);
};

// Creates an array of BinarySegment objects, where each element represents
// a segment starting at a different offset within the original string,
// up to BINARY_SEGMENT_CHUNK_SIZE offsets.
const createSegmentSequence = (inputString) => {
  const resultSequence = new Array(BINARY_SEGMENT_CHUNK_SIZE).fill(null);
  for (let i = 0; i < BINARY_SEGMENT_CHUNK_SIZE && i < inputString.length; i++) {
    resultSequence[i] = BinarySegment.fromString(inputString.slice(i));
  }
  return resultSequence;
};

// A pre-allocated temporary buffer for segment sequence operations
const temporarySegmentSequenceBuffer = new Array(BINARY_SEGMENT_CHUNK_SIZE).fill(null);

// Copies properties from a source segment sequence to a destination.
// This is used to create a mutable copy for shifting operations.
const transferSegmentSequenceData = (destinationSequence, sourceSequence) => {
  for (let idx = 0; idx < sourceSequence.length; idx++) {
    const sourceSegment = sourceSequence[idx];
    if (!sourceSegment) {
      destinationSequence[idx] = null;
      continue;
    }

    // Deep copy the BinarySegment object
    if (!destinationSequence[idx]) {
      destinationSequence[idx] = new BinarySegment(
        sourceSegment.totalLength,
        sourceSegment.currentOffset,
        [...sourceSegment.numericalBody] // Create new array for body
      );
    } else {
      // Update existing object
      destinationSequence[idx].totalLength = sourceSegment.totalLength;
      destinationSequence[idx].currentOffset = sourceSegment.currentOffset;
      destinationSequence[idx].numericalBody = [...sourceSegment.numericalBody];
    }
  }
};

// Performs a matching operation between a sequence of potential field segments
// and a single pattern segment. It checks for prefix matches at various offsets.
const findSegmentMatches = (fieldSegmentSequence, patternSegment) => {
  // Ensure pattern segment is valid
  if (!patternSegment || patternSegment.totalLength === 0) {
    return [];
  }

  // Use the temporary buffer to avoid modifying the original fieldSegmentSequence
  transferSegmentSequenceData(temporarySegmentSequenceBuffer, fieldSegmentSequence);

  const matchResults = [];
  let currentOffset = 0;

  // Iterate through the sequence, checking for matches and shifting segments
  while (temporarySegmentSequenceBuffer[currentOffset] && temporarySegmentSequenceBuffer[currentOffset].totalLength >= patternSegment.totalLength) {
    const currentFieldSegment = temporarySegmentSequenceBuffer[currentOffset];
    matchResults.push(isPrefixMatch(currentFieldSegment, patternSegment));

    // Shift the current field segment for the next iteration at this offset
    temporarySegmentSequenceBuffer[currentOffset].shiftWindow();

    // Move to the next offset in the circular buffer
    currentOffset = (currentOffset + 1) % BINARY_SEGMENT_CHUNK_SIZE;
  }
  return matchResults;
};

// Pre-process the grid data into segment sequences for efficient matching
const processedGridField = gridDataRows.map(createSegmentSequence);

// Pre-process the pattern data into individual segments
const processedPatternSegments = patternDataRows.map(BinarySegment.fromString);

// Initialize a matrix to store match counts for each potential top-left corner (row, col)
const matchCountMatrix = Array.from({ length: gridHeight - patternHeight + 1 }, () =>
  new Array(gridWidth - patternWidth + 1).fill(0)
);

let totalOccurrencesFound = 0;

// Main pattern matching loop
for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
  // Inner loop iterates through pattern rows that could potentially align with the current grid row.
  // The 'relativePatternRow' represents which row of the pattern (0 to patternHeight-1)
  // is currently being considered for alignment with 'rowIdx' of the grid.
  for (let relativePatternRow = 0; relativePatternRow < patternHeight; relativePatternRow++) {
    // Calculate the corresponding grid row index for the pattern's first row.
    // This is `rowIdx - relativePatternRow`.
    const effectiveGridRowStart = rowIdx - relativePatternRow;

    // Ensure the effective grid row start is within valid bounds for the result matrix.
    if (effectiveGridRowStart < 0 || effectiveGridRowStart > gridHeight - patternHeight) {
      continue;
    }

    // Perform segment matching for the current grid row and the current pattern row.
    const currentMatches = findSegmentMatches(processedGridField[rowIdx], processedPatternSegments[relativePatternRow]);

    // Update the match count matrix based on the results.
    for (let colOffset = 0; colOffset < currentMatches.length; colOffset++) {
      if (currentMatches[colOffset]) {
        matchCountMatrix[effectiveGridRowStart][colOffset]++;
      }
    }
  }
}

// Check the match count matrix for complete pattern occurrences.
for (let r = 0; r < matchCountMatrix.length; r++) {
  for (let c = 0; c < matchCountMatrix[r].length; c++) {
    if (matchCountMatrix[r][c] === patternHeight) {
      console.log(`${r} ${c}`);
      totalOccurrencesFound++;
    }
  }
}

// Optionally, provide feedback if no matches were found.
if (totalOccurrencesFound === 0) {
  // console.log("No full pattern occurrences found."); // This is not part of original spec, but good for Type III
}