/*
 * Creates a two-dimensional array (grid) filled with zeros.
 * @param {number} numRows - The number of rows for the grid.
 * @param {number} numCols - The number of columns for the grid. If not provided, it defaults to numRows.
 * @returns {Array<Array<number>>} A 2D array.
 */
function createTwoDimArray (  numRows ,  numCols  ) {
  numCols = numCols || numRows;
  // Initialize an array with `numRows` elements, then map each to another array of `numCols` elements.
  return Array(numRows).fill(0).map( _ => Array(numCols).fill(0) ) ;
}

/**
 * A utility class to parse input data, typically from standard input.
 * It processes the input string line by line and provides methods
 * to extract various data types.
 * @param {string} sourceText - The entire input content as a single string.
 */
function DataParser (  sourceText  ) {
  this._sourceLines = sourceText.split('\n'); // Store all lines from the input.
  this._linePointer = 0; // Tracks the current line being processed.
}

DataParser.prototype = {
  /**
   * Extracts a single item (token) from the current line.
   * If the line is exhausted, it moves to the next line.
   * @param {boolean} returnAsString - If true, returns the item as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The extracted item.
   */
  extractItem: function(  returnAsString  ) {
    var sourceLines = this._sourceLines;
    var lineIndex = this._linePointer;
    var resultValue;

    // If the current line hasn't been split into tokens yet, split it and reverse to use pop().
    if ( typeof sourceLines[lineIndex] === 'string' ) {
      sourceLines[lineIndex] = sourceLines[lineIndex].split(' ').reverse();
    }
    resultValue = sourceLines[lineIndex].pop(); // Get the last token.

    // If the current line is now empty after popping, advance to the next line.
    if ( ! sourceLines[lineIndex].length ) {
      this._linePointer++;
    }
    // Return as string or convert to number based on the flag.
    return returnAsString ? resultValue : +resultValue;
  },

  // Aliases for extractItem for readability.
  getSingle: function(  isText  ) { return this.extractItem(isText); },
  retrieveOne: function(  isStr  ) { return this.extractItem(isStr); },

  /**
   * Reads an entire line from the input.
   * @param {boolean} keepAsStrings - If true, returns an array of strings; otherwise, an array of numbers.
   * @returns {Array<string|number>} An array of items from the current line.
   */
  fetchLine: function(  keepAsStrings  ) {
    var linesArray = this._sourceLines;
    var currLineIdx = this._linePointer;

    // Ensure the line is split. The reverse() is to maintain consistency with extractItem's pop logic
    // if a line was partially consumed by extractItem.
    linesArray[currLineIdx] = typeof linesArray[currLineIdx] === 'string'
      ? linesArray[currLineIdx].split(' ')
      : linesArray[currLineIdx].reverse();
    this._linePointer++; // Move to the next line.

    // Return the line as an array of strings or map to numbers.
    return keepAsStrings ? linesArray[currLineIdx] : linesArray[currLineIdx].map( val => +val ) ;
  },

  // Aliases for fetchLine for readability.
  getCompleteLine: function(  isStringArray  ) { return this.fetchLine(isStringArray); },
  obtainRow: function(  isTextArray  ) { return this.fetchLine(isTextArray); },

  /**
   * Reads multiple consecutive lines and forms a matrix.
   * @param {number} countRows - The number of lines to read.
   * @param {boolean} leaveAsText - If true, elements remain strings; otherwise, they are converted to numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix).
   */
  readMultiLine: function(  countRows ,  leaveAsText  ) {
    var sourceStorage = this._sourceLines;
    var currentY = this._linePointer;
    var resultCollection = [];
    var counter = 0;

    if ( leaveAsText ) {
      for ( ; counter < countRows ; counter++ ) {
        resultCollection[counter] = sourceStorage[currentY + counter].split(' ');
      }
    } else {
      for ( ; counter < countRows ; counter++ ) {
        resultCollection[counter] = sourceStorage[currentY + counter].split(' ').map( val => +val );
      }
    }
    this._linePointer += countRows; // Advance the pointer by the number of lines read.
    return resultCollection;
  },

  // Alias for readMultiLine.
  retrieveMatrix: function(  lineCount ,  isStringMode  ) { return this.readMultiLine(lineCount, isStringMode); },

  /**
   * Reads 'entryCount' lines, each containing two indices, and increments a counter
   * at the specified position in a 2D grid.
   * @param {number} gridSize - The size for the initial 2D grid (gridSize + 1).
   * @param {number} entryCount - The number of lines to read for populating the grid.
   * @returns {Array<Array<number>>} The populated 2D grid.
   */
  populateGrid: function(  gridSize ,  entryCount  ) {
    var lineSource = this._sourceLines;
    var linePointer = this._linePointer;
    var targetGrid = createTwoDimArray(gridSize + 1); // Create grid with 1-based indexing in mind.

    for ( var loopIndex = 0 ; loopIndex < entryCount ; loopIndex++ ) {
      var currentEntry = lineSource[linePointer + loopIndex].split(' ');
      targetGrid[currentEntry[0]][currentEntry[1]]++; // Increment count at the specified cell.
    }
    this._linePointer += entryCount; // Advance the pointer.
    return targetGrid;
  },
};

// Global arrays for Union-Find data structures.
var parentSetA = [];
var parentSetB = [];

/**
 * Finds the representative (root) of the set to which an element belongs,
 * with path compression optimization.
 * @param {Array<number>} unionFindArray - The array representing the parent pointers.
 * @param {number} elementId - The ID of the element to find the root for.
 * @returns {number} The representative (root) of the element's set.
 */
function findRepresentative (  unionFindArray ,  elementId  ) {
  // If the element is its own parent, it's the root.
  return unionFindArray[elementId] === elementId
    ? elementId
    // Otherwise, recursively find the root and compress the path.
    : ( unionFindArray[elementId] = findRepresentative(unionFindArray, unionFindArray[elementId]) );
}

/**
 * Checks if two elements belong to the same set in a Union-Find structure.
 * @param {Array<number>} ufArray - The Union-Find parent array.
 * @param {number} nodeX - The first element.
 * @param {number} nodeY - The second element.
 * @returns {boolean} True if they are in the same set, false otherwise.
 */
function areConnected (  ufArray ,  nodeX ,  nodeY  ) {
  return findRepresentative(ufArray, nodeX) === findRepresentative(ufArray, nodeY) ;
}

/**
 * Unites the sets containing two elements in a Union-Find structure.
 * @param {Array<number>} ufStructure - The Union-Find parent array.
 * @param {number} itemX - The first element.
 * @param {number} itemY - The second element.
 */
function unionSets (  ufStructure ,  itemX ,  itemY  ) {
  // Find the representatives of both elements.
  itemX = findRepresentative(ufStructure, itemX);
  itemY = findRepresentative(ufStructure, itemY);

  // If they are already in the same set, do nothing.
  if ( itemX === itemY ) {
    return;
  }
  // Otherwise, make one representative point to the other.
  ufStructure[itemX] = itemY;
}

// Create an instance of the DataParser, reading from standard input.
var dataInput = new DataParser( require('fs').readFileSync('/dev/stdin', 'utf8') );

// Execute the main processing function and print its result.
console.log( processSolution() );

/**
 * Main function containing the problem's logic.
 * Reads input, performs Union-Find operations, and calculates a final result.
 * @returns {string} The space-separated string of calculated counts.
 */
function processSolution (  ) {
  // Read N, K, L from the input.
  var totalElements = dataInput.extractItem();
  var numConnectionsK = dataInput.extractItem();
  var numConnectionsL = dataInput.extractItem();

  // Initialize two Union-Find data structures.
  // Each element is initially its own parent (representing individual sets).
  for ( var index = 0 ; index <= totalElements ; index++ ) {
    parentSetA[index] = parentSetB[index] = index;
  }

  // Process K connections for the first Union-Find structure.
  for ( index = 0 ; index < numConnectionsK ; index++ ) {
    var currentPair = dataInput.fetchLine();
    unionSets(parentSetA, currentPair[0], currentPair[1]);
  }

  // Process L connections for the second Union-Find structure.
  for ( index = 0 ; index < numConnectionsL ; index++ ) {
    currentPair = dataInput.fetchLine();
    unionSets(parentSetB, currentPair[0], currentPair[1]);
  }

  // Arrays to store combined root identifiers and their counts.
  var combinedRoots = [];
  var rootCounts = {};
  var finalResults = [];

  // For each element, find its root in both Union-Find structures,
  // combine them into a string identifier, and count occurrences of each combined identifier.
  for ( index = 0 ; index < totalElements ; index++ ) {
    combinedRoots[index] = findRepresentative(parentSetA, index + 1) + ',' + findRepresentative(parentSetB, index + 1);
    if ( rootCounts[combinedRoots[index]] ) {
      rootCounts[combinedRoots[index]]++;
    } else {
      rootCounts[combinedRoots[index]] = 1;
    }
  }

  // Populate the final results array with the counts corresponding to each element's combined root.
  for ( index = 0 ; index < totalElements ; index++ ) {
    finalResults[index] = rootCounts[combinedRoots[index]];
  }

  // Return the results as a space-separated string.
  return finalResults.join(' ');
}