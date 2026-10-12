const appConfig = {
  input: '/dev/stdin',
  newline: process.platform === 'win32' ? '\r\n' : '\n'
};

const assertionModule = require('assert');
let temporarySeriesBuffer; // Global buffer for segment series matching, as in original

// Helper function to reverse a binary string and parse it to an integer
function parseReversedBinaryString(binaryString) {
  const reversedString = binaryString.split('').reverse().join('');
  return parseInt(reversedString, 2);
}

// Constant defining the length of binary chunks for segment representation
const BINARY_CHUNK_SIZE = 30;

// Renamed from makeSegment
function createBinarySegmentRepresentation(inputString) {
  const segmentArray = [];
  for (let charIdx = 0; charIdx < inputString.length; charIdx += BINARY_CHUNK_SIZE) {
    segmentArray.push(parseReversedBinaryString(inputString.substring(charIdx, charIdx + BINARY_CHUNK_SIZE)));
  }
  return {
    length: inputString.length,
    offset: 0,
    body: segmentArray
  };
}

// Renamed from isHead
function isPrefixMatch(mainSegment, prefixSegment) {
  assertionModule(mainSegment.length >= prefixSegment.length, "Main segment must be longer or equal to prefix segment.");

  let mainLength = mainSegment.length;
  let prefixLength = prefixSegment.length;
  let mainOffset = mainSegment.offset;
  let prefixOffset = prefixSegment.offset;
  const mainBody = mainSegment.body;
  const prefixBody = prefixSegment.body;

  // Early exit if prefix is empty or main segment is too short for a meaningful check
  if (prefixLength === 0) return true;
  if (mainLength < prefixLength) return false;

  // Compare full chunks
  while (prefixLength > BINARY_CHUNK_SIZE) {
    if (prefixBody[prefixOffset] !== mainBody[mainOffset]) {
      return false;
    }
    prefixOffset++;
    mainOffset++;
    prefixLength -= BINARY_CHUNK_SIZE;
    mainLength -= BINARY_CHUNK_SIZE;
  }

  // Compare the remaining partial chunk using a bitmask
  const remainingMask = (1 << prefixLength) - 1;
  const mainRemainingValue = mainBody[mainOffset] & remainingMask;
  const prefixRemainingValue = prefixBody[prefixOffset];

  return mainRemainingValue === prefixRemainingValue;
}

// Renamed from shiftSegment
function advanceSegmentPointer(segmentObject) {
  segmentObject.length -= BINARY_CHUNK_SIZE;
  segmentObject.offset++;
  if (segmentObject.length <= 0) {
    return null;
  }
  return segmentObject;
}

// Renamed from makeSegmentSeries
function generateSegmentSeriesFromText(sourceString) {
  const resultSeries = new Array(BINARY_CHUNK_SIZE).fill(null);
  for (let seriesIndex = 0; seriesIndex < BINARY_CHUNK_SIZE && seriesIndex < sourceString.length; seriesIndex++) {
    resultSeries[seriesIndex] = createBinarySegmentRepresentation(sourceString.slice(seriesIndex));
  }
  return resultSeries;
}

// Renamed from copySegmentSeries
function cloneSegmentSeriesStructure(destinationSeries, sourceSeries) {
  for (const seriesIndex in sourceSeries) {
    const sourceItem = sourceSeries[seriesIndex];
    if (!sourceItem) {
      destinationSeries[seriesIndex] = null;
      continue;
    }
    // Perform a shallow copy of the segment object properties
    destinationSeries[seriesIndex] = Object.assign({}, sourceItem);
  }
}

// Renamed from segmentMatch
function findSegmentMatchesInSeries(targetSeries, patternSegment) {
  const workingSeries = temporarySeriesBuffer; // Use the global buffer
  cloneSegmentSeriesStructure(workingSeries, targetSeries); // Populate buffer with a copy of the target series

  const matchResults = [];
  let seriesIndex = 0;
  while (workingSeries[seriesIndex] && workingSeries[seriesIndex].length >= patternSegment.length) {
    matchResults.push(isPrefixMatch(workingSeries[seriesIndex], patternSegment));
    workingSeries[seriesIndex] = advanceSegmentPointer(workingSeries[seriesIndex]);
    seriesIndex = (seriesIndex + 1) % BINARY_CHUNK_SIZE; // Cycle index within the buffer
  }
  return matchResults;
}

// Function to read and parse initial input data
function readAndProcessInput(configuration) {
  const rawInputLines = require('fs').readFileSync(configuration.input, 'ascii').split(configuration.newline);

  const firstLineNumbers = rawInputLines[0].split(' ').map(Number);
  const gridHeight = firstLineNumbers[0];
  const gridWidth = firstLineNumbers[1];

  const gridField = rawInputLines.slice(1, 1 + gridHeight);

  const patternDimensions = rawInputLines[1 + gridHeight].split(' ').map(Number);
  const patternHeight = patternDimensions[0];
  const patternWidth = patternDimensions[1];

  const patternData = rawInputLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternHeight);

  // Guard clause: if pattern is larger than grid, no match is possible
  if (gridHeight < patternHeight || gridWidth < patternWidth) {
    process.exit(0); // Exit with success code as no matches are found
  }

  return {
    gridHeight,
    gridWidth,
    gridField,
    patternHeight,
    patternWidth,
    patternData
  };
}

// Function to initialize a 2D array (match grid) with zeros
function initializeMatchGrid(rows, cols) {
  const grid = new Array(rows);
  for (let r = 0; r < rows; r++) {
    grid[r] = new Array(cols).fill(0);
  }
  return grid;
}

// Main execution function
function main() {
  const {
    gridHeight,
    gridWidth,
    gridField,
    patternHeight,
    patternWidth,
    patternData
  } = readAndProcessInput(appConfig);

  // Initialize the global temporary buffer for segment series matching
  temporarySeriesBuffer = new Array(BINARY_CHUNK_SIZE).fill(null);

  // Convert grid and pattern data into their segment representations
  const processedGridField = gridField.map(generateSegmentSeriesFromText);
  const processedPatternData = patternData.map(createBinarySegmentRepresentation);

  // Initialize the result grid to count pattern matches
  const matchGrid = initializeMatchGrid(gridHeight - patternHeight + 1, gridWidth - patternWidth + 1);

  // Iterate through the grid to find pattern occurrences
  for (let currentGridRow = 0; currentGridRow < gridHeight; currentGridRow++) {
    const minPatternRowIndex = Math.max(0, currentGridRow - gridHeight + patternHeight);
    const maxPatternRowIndex = Math.min(patternHeight - 1, currentGridRow);

    for (let currentPatternRow = minPatternRowIndex; currentPatternRow <= maxPatternRowIndex; currentPatternRow++) {
      const rowMatches = findSegmentMatchesInSeries(processedGridField[currentGridRow], processedPatternData[currentPatternRow]);

      // Update the matchGrid based on the found row matches
      for (let matchOffset = 0; matchOffset < rowMatches.length; matchOffset++) {
        if (rowMatches[matchOffset]) {
          const targetRowInMatchGrid = currentGridRow - currentPatternRow;
          const targetColInMatchGrid = matchOffset;

          // Ensure indices are within the bounds of the matchGrid
          if (targetRowInMatchGrid >= 0 && targetRowInMatchGrid < matchGrid.length &&
              targetColInMatchGrid >= 0 && targetColInMatchGrid < matchGrid[0].length) {
            matchGrid[targetRowInMatchGrid][targetColInMatchGrid]++;
          }
        }
      }
    }
  }

  // Print the coordinates where the full pattern is found
  for (let outputRow = 0; outputRow < matchGrid.length; outputRow++) {
    for (let outputCol = 0; outputCol < matchGrid[outputRow].length; outputCol++) {
      if (matchGrid[outputRow][outputCol] === patternHeight) {
        console.log('%s %s', outputRow, outputCol);
      }
    }
  }
}

// Execute the main function
main();
