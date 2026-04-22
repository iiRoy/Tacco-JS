// Application configuration settings
const applicationConfig = {
  dataSourcePath: '/dev/stdin', // Path for input data, e.g., '/dev/stdin' for Linux, 'tmp' for Windows
  lineDelimiter: '\n',           // Newline character, e.g., '\n' for Linux, '\r\n' for Windows
  enableVerboseLogging: false    // Set to true for detailed console output
};

// Custom assertion utility for input validation
const inputAssertion = require('assert');

// Define the size of each binary segment chunk (max 30 for standard JS Number precision)
const BINARY_FRAGMENT_BIT_LENGTH = 30;

/**
 * Parses a numeric string into an integer.
 * @param {string} str - The string to parse.
 * @returns {number} The parsed integer.
 */
const parseNumericValue = (str) => {
  const parsed = Number(str);
  if (isNaN(parsed)) {
    console.error(`Error: Invalid numeric value encountered: "${str}"`);
    process.exit(1);
  }
  return parsed;
};

/**
 * Utility namespace for segment operations.
 */
const SegmentProcessor = {
  /**
   * Converts a binary string chunk (reversed) to an integer.
   * @param {string} binaryChunk - The binary string chunk.
   * @returns {number} The integer representation.
   */
  _parseReversedBinaryChunk: (binaryChunk) => {
    // Reverse the chunk and parse it as a base-2 integer
    return parseInt(binaryChunk.split('').reverse().join(''), 2);
  },

  /**
   * Creates a segment object from a given binary string.
   * A segment object breaks the string into fixed-size binary chunks.
   * @param {string} sourceSequence - The input binary string.
   * @returns {object} A segment descriptor object.
   */
  createSegmentObject: (sourceSequence) => {
    const binaryChunks = [];
    // Iterate through the string, extracting chunks of BINARY_FRAGMENT_BIT_LENGTH
    for (let currentIdx = 0; currentIdx < sourceSequence.length; currentIdx += BINARY_FRAGMENT_BIT_LENGTH) {
      const chunk = sourceSequence.slice(currentIdx, currentIdx + BINARY_FRAGMENT_BIT_LENGTH);
      binaryChunks.push(SegmentProcessor._parseReversedBinaryChunk(chunk));
    }
    // Return an object describing the segment: its original length, current offset, and parsed chunks.
    return { currentLength: sourceSequence.length, currentOffset: 0, binaryChunks };
  },

  /**
   * Checks if a pattern segment is a prefix (head) of a target segment.
   * @param {object} targetSegmentObj - The larger segment object.
   * @param {object} patternSegmentObj - The smaller pattern segment object.
   * @returns {boolean} True if the pattern is a prefix, false otherwise.
   */
  checkPrefixMatch: (targetSegmentObj, patternSegmentObj) => {
    inputAssertion(targetSegmentObj.currentLength >= patternSegmentObj.currentLength,
      "Target segment must be at least as long as pattern segment for prefix check.");

    if (!targetSegmentObj || !patternSegmentObj) {
      if (applicationConfig.enableVerboseLogging) {
        console.warn("Attempted checkPrefixMatch with null/undefined segment object(s).");
      }
      return false;
    }

    let currentTargetLen = targetSegmentObj.currentLength;
    let currentPatternLen = patternSegmentObj.currentLength;
    let targetChunkOffset = targetSegmentObj.currentOffset;
    let patternChunkOffset = patternSegmentObj.currentOffset;

    const targetChunkData = targetSegmentObj.binaryChunks;
    const patternChunkData = patternSegmentObj.binaryChunks;

    // Compare full chunks first
    while (currentPatternLen > BINARY_FRAGMENT_BIT_LENGTH) {
      if (patternChunkData[patternChunkOffset] !== targetChunkData[targetChunkOffset]) {
        return false; // Mismatch found
      }
      patternChunkOffset++;
      targetChunkOffset++;
      currentPatternLen -= BINARY_FRAGMENT_BIT_LENGTH;
      currentTargetLen -= BINARY_FRAGMENT_BIT_LENGTH;
    }

    // Compare the remaining partial chunk
    // Use bitwise AND for efficiency if pattern length is a power of 2, otherwise modulo.
    // Since pattern length can be anything, modulo is safer.
    return (targetChunkData[targetChunkOffset] % (1 << currentPatternLen) === patternChunkData[patternChunkOffset]);
  },

  /**
   * Advances a segment object's internal offset, effectively "shifting" it.
   * @param {object} segmentInstance - The segment object to shift.
   * @returns {object|null} The shifted segment object, or null if it becomes empty.
   */
  advanceSegmentOffset: (segmentInstance) => {
    if (!segmentInstance) return null;

    segmentInstance.currentLength -= BINARY_FRAGMENT_BIT_LENGTH;
    segmentInstance.currentOffset++;

    // If the segment's length becomes zero or negative, it's considered exhausted
    if (segmentInstance.currentLength <= 0) {
      return null;
    }
    return segmentInstance;
  },

  /**
   * Generates a series of segment objects, each starting at a different initial offset
   * up to BINARY_FRAGMENT_BIT_LENGTH.
   * @param {string} sourceSequence - The input binary string.
   * @returns {Array<object|null>} An array of segment objects.
   */
  generateSegmentSeries: (sourceSequence) => {
    const seriesResult = Array.from({ length: BINARY_FRAGMENT_BIT_LENGTH }).fill(null);
    for (let currentOffset = 0; currentOffset < BINARY_FRAGMENT_BIT_LENGTH && currentOffset < sourceSequence.length; currentOffset++) {
      seriesResult[currentOffset] = SegmentProcessor.createSegmentObject(sourceSequence.slice(currentOffset));
    }
    return seriesResult;
  },

  /**
   * Deeply replicates a segment series from source to destination.
   * @param {Array<object|null>} destinationSeries - The array to copy into.
   * @param {Array<object|null>} sourceSeries - The array to copy from.
   */
  replicateSegmentSeries: (destinationSeries, sourceSeries) => {
    for (let idx = 0; idx < sourceSeries.length; idx++) {
      const sourceSegment = sourceSeries[idx];
      if (!sourceSegment) {
        destinationSeries[idx] = null;
        continue;
      }
      // Ensure destination entry exists before copying properties
      if (!destinationSeries[idx]) {
        destinationSeries[idx] = {};
      }
      // Use Object.assign for shallow copy of the segment object's properties.
      // Note: binaryChunks array is not deep-copied here, which is fine as it's immutable after creation.
      Object.assign(destinationSeries[idx], sourceSegment);
    }
  }
};

// --- Main execution flow ---

// Ensure file system module is available
const fileSystemModule = require('fs');
if (!fileSystemModule || typeof fileSystemModule.readFileSync !== 'function') {
  console.error("Error: 'fs' module or 'readFileSync' function not available.");
  process.exit(1);
}

// Read raw input data from the specified source
const rawInputLines = fileSystemModule.readFileSync(applicationConfig.dataSourcePath, 'ascii')
  .split(applicationConfig.lineDelimiter);

// Validate minimum input lines
if (rawInputLines.length < 2) {
  console.error("Error: Insufficient input data provided.");
  process.exit(1);
}

// Parse initial dimensions for the main grid
const mainGridDimensionsLine = rawInputLines[0].split(' ').map(parseNumericValue);
const gridHeight = mainGridDimensionsLine[0];
const gridWidth = mainGridDimensionsLine[1];

// Validate grid dimensions
if (gridHeight <= 0 || gridWidth <= 0) {
  console.error("Error: Main grid dimensions must be positive.");
  process.exit(1);
}

// Extract main grid data (binary strings)
const mainGridDataSegments = rawInputLines.slice(1, 1 + gridHeight);

// Validate sufficient lines for main grid
if (mainGridDataSegments.length !== gridHeight) {
  console.error("Error: Mismatch between declared grid height and actual input lines.");
  process.exit(1);
}

// Parse dimensions for the pattern
const patternDimensionsLineIndex = 1 + gridHeight;
if (patternDimensionsLineIndex >= rawInputLines.length) {
  console.error("Error: Missing pattern dimension line in input.");
  process.exit(1);
}
const patternDimensionsLine = rawInputLines[patternDimensionsLineIndex].split(' ').map(parseNumericValue);
const patternHeight = patternDimensionsLine[0];
const patternWidth = patternDimensionsLine[1];

// Validate pattern dimensions
if (patternHeight <= 0 || patternWidth <= 0) {
  console.error("Error: Pattern dimensions must be positive.");
  process.exit(1);
}

// Extract pattern data (binary strings)
const patternDataStartIndex = 1 + gridHeight + 1;
const searchPatternSegments = rawInputLines.slice(patternDataStartIndex, patternDataStartIndex + patternHeight);

// Validate sufficient lines for pattern
if (searchPatternSegments.length !== patternHeight) {
  console.error("Error: Mismatch between declared pattern height and actual input lines.");
  process.exit(1);
}

// Early exit if pattern is larger than the grid
if (gridHeight < patternHeight || gridWidth < patternWidth) {
  if (applicationConfig.enableVerboseLogging) {
    console.log("Pattern is larger than the grid. No matches possible. Exiting.");
  }
  process.exit(0); // Exit gracefully as no matches can be found
}

// Transform grid strings into segment series
const processedGridSegments = mainGridDataSegments.map(SegmentProcessor.generateSegmentSeries);

// Transform pattern strings into individual segment objects
const processedPatternSegments = searchPatternSegments.map(SegmentProcessor.createSegmentObject);

// Global buffer for segment series replication during matching
const workingSeriesBuffer = Array.from({ length: BINARY_FRAGMENT_BIT_LENGTH }).fill(null);

/**
 * Finds all occurrences of a pattern segment within a series of target segments.
 * This function handles the complex shifting logic to check all possible alignments.
 * @param {Array<object|null>} targetSegmentSeries - A series of segments representing a row in the grid.
 * @param {object} patternSegmentObj - The pattern segment to search for.
 * @returns {Array<boolean>} An array indicating match status at each potential starting offset.
 */
const findSegmentMatches = (targetSegmentSeries, patternSegmentObj) => {
  const matchResults = [];
  // Replicate the target series into the working buffer to avoid modifying original data
  SegmentProcessor.replicateSegmentSeries(workingSeriesBuffer, targetSegmentSeries);

  let currentSeriesIndex = 0; // Represents the initial character offset (0 to BINARY_FRAGMENT_BIT_LENGTH-1)
  let loopCounter = 0; // Safeguard against infinite loops, ensuring we don't process too many 'shifts'

  // The original loop structure implies a continuous shifting and re-evaluation
  // of segments at different initial offsets.
  while (workingSeriesBuffer[currentSeriesIndex] &&
         workingSeriesBuffer[currentSeriesIndex].currentLength >= patternSegmentObj.currentLength &&
         loopCounter < gridWidth * BINARY_FRAGMENT_BIT_LENGTH) { // Arbitrary large loop limit as a safeguard
    
    // Check for a prefix match at the current initial offset and shifted position
    matchResults.push(SegmentProcessor.checkPrefixMatch(workingSeriesBuffer[currentSeriesIndex], patternSegmentObj));
    
    // Shift the segment at the current initial offset
    workingSeriesBuffer[currentSeriesIndex] = SegmentProcessor.advanceSegmentOffset(workingSeriesBuffer[currentSeriesIndex]);
    
    // Move to the next initial offset (circularly)
    currentSeriesIndex++;
    if (currentSeriesIndex === BINARY_FRAGMENT_BIT_LENGTH) {
      currentSeriesIndex = 0; // Wrap around to process the first offset's next shifted state
    }
    loopCounter++;
  }
  return matchResults;
};

// Initialize a matrix to store match counts for each potential top-left corner
const matchCountMatrix = Array.from({ length: gridHeight - patternHeight + 1 }, () =>
  Array.from({ length: gridWidth - patternWidth + 1 }).fill(0)
);

// Iterate through the main grid to find pattern occurrences
for (let gridRowIndex = 0; gridRowIndex < gridHeight; gridRowIndex++) {
  // Determine the range of pattern rows that could align with the current grid row.
  // This optimization helps avoid unnecessary comparisons.
  const minPatternRow = Math.max(0, gridRowIndex - gridHeight + patternHeight);
  const maxPatternRow = Math.min(patternHeight - 1, gridRowIndex);

  for (let patternRowIndex = minPatternRow; patternRowIndex <= maxPatternRow; patternRowIndex++) {
    // Perform segment matching for the current grid row against the current pattern row
    const currentMatchResults = findSegmentMatches(processedGridSegments[gridRowIndex], processedPatternSegments[patternRowIndex]);

    // Update the match count matrix based on the results
    currentMatchResults.forEach((isMatched, segmentStartingOffset) => {
      // If a match is found for a segment, increment the count in the corresponding cell
      // The cell index is derived from the current grid row and the segment's starting offset.
      if (isMatched) {
        const matrixRow = gridRowIndex - patternRowIndex;
        const matrixCol = segmentStartingOffset;
        
        // Ensure bounds are respected for the match matrix
        if (matrixRow >= 0 && matrixRow < matchCountMatrix.length &&
            matrixCol >= 0 && matrixCol < matchCountMatrix[matrixRow].length) {
          matchCountMatrix[matrixRow][matrixCol]++;
        } else if (applicationConfig.enableVerboseLogging) {
          console.warn(`Out of bounds matrix update attempt: [${matrixRow}, ${matrixCol}]`);
        }
      }
    });
  }
}

// Output the coordinates where the full pattern is found
matchCountMatrix.forEach((row, rowIndex) => {
  row.forEach((count, colIndex) => {
    // A full pattern match occurs when the count equals the pattern's height
    if (count === patternHeight) {
      console.log(`${rowIndex} ${colIndex}`);
    }
  });
});

if (applicationConfig.enableVerboseLogging) {
  console.log("Program execution completed.");
}