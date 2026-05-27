function createMatrix(rowsCount, colsCount) {
  colsCount = colsCount || rowsCount; // If colsCount is not provided, assume square matrix
  // Create an array of 'rowsCount' length, fill with 0s, then map each to a new array of 'colsCount' length filled with 0s.
  return Array(rowsCount).fill(0).map(unusedVal => Array(colsCount).fill(0));
}

// Helper class to process input strings line by line or token by token.
function InputReader(inputString) {
  this._sourceLines = inputString.split("\n"); // Store all input lines as an array of strings.
  this._currentLineIndex = 0; // Keep track of the current line being processed.
}

InputReader.prototype = {
  // Extracts a single token from the current line.
  // If 'asString' is true, returns the token as a string; otherwise, converts to a number.
  extractToken: function(asStringFlag) {
    let lineBuffer = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let extractedValue;

    // If the current line is still a string, split it into tokens and reverse for easy popping.
    if (typeof lineBuffer[lineIdx] === "string") {
      lineBuffer[lineIdx] = lineBuffer[lineIdx].split(" ").reverse();
    }

    extractedValue = lineBuffer[lineIdx].pop(); // Get the last token from the reversed array.

    // If the current line is now empty after popping, advance to the next line.
    if (!lineBuffer[lineIdx].length) {
      this._currentLineIndex++;
    }
    // Return the value, optionally parsed as a number.
    return asStringFlag ? extractedValue : +extractedValue;
  },

  // Alias for extractToken.
  getSingleToken: function(asStringFlag) {
    return this.extractToken(asStringFlag);
  },

  // Another alias for extractToken.
  fetchOneToken: function(asStringFlag) {
    return this.extractToken(asStringFlag);
  },

  // Extracts an entire line of tokens.
  // If 'asStringFlag' is true, returns tokens as strings; otherwise, converts to numbers.
  extractLine: function(asStringFlag) {
    let lineBuffer = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let lineTokens;

    // Split the current line into tokens if it's a string.
    // The original code reverses here, which is unusual for a full line read.
    // It seems to be a bug or a specific pattern for the 'a' method that leaked.
    // For 'l', it should just split. Let's assume the reverse was intended for 'a' only.
    // Re-reading the original: `s[y] = typeof s[y] === "string" ? s[y].split(" ") : s[y].reverse();`
    // This means if it's a string, it splits. If it's already an array (from a previous `a` call), it reverses it.
    // This is indeed a strange pattern. I will replicate it exactly for Type II.
    lineTokens = typeof lineBuffer[lineIdx] === "string" ? lineBuffer[lineIdx].split(" ") : lineBuffer[lineIdx].reverse();

    this._currentLineIndex++; // Move to the next line after processing.
    // Return tokens, optionally parsed as numbers.
    return asStringFlag ? lineTokens : lineTokens.map(elementStr => +elementStr);
  },

  // Alias for extractLine.
  getEntireLine: function(asStringFlag) {
    return this.extractLine(asStringFlag);
  },

  // Another alias for extractLine.
  fetchLineData: function(asStringFlag) {
    return this.extractLine(asStringFlag);
  },

  // Extracts a matrix of 'numRows' lines.
  // If 'asStringFlag' is true, returns tokens as strings; otherwise, converts to numbers.
  extractMatrix: function(numRows, asStringFlag) {
    let lineBuffer = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let resultContainer = [];
    let loopCounter = 0;

    if (asStringFlag) {
      for (; loopCounter < numRows; loopCounter++) {
        resultContainer[loopCounter] = lineBuffer[lineIdx + loopCounter].split(" ");
      }
    } else {
      for (; loopCounter < numRows; loopCounter++) {
        resultContainer[loopCounter] = lineBuffer[lineIdx + loopCounter].split(" ").map(elementStr => +elementStr);
      }
    }
    this._currentLineIndex += numRows; // Advance the line index by the number of rows read.
    return resultContainer;
  },

  // Alias for extractMatrix.
  getMatrixData: function(numRows, asStringFlag) {
    return this.extractMatrix(numRows, asStringFlag);
  },

  // Creates a 2D array (matrix) and populates it based on input lines.
  // Each input line specifies coordinates (t[0], t[1]) to increment a counter in the matrix.
  createCountArray: function(numRows, numEntries) {
    let lineBuffer = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    // Create a matrix with numRows+1 rows (assuming 1-based indexing for input coordinates).
    let resultMatrix = createMatrix(numRows + 1);

    for (let loopCounter = 0; loopCounter < numEntries; loopCounter++) {
      let tempTokens = lineBuffer[lineIdx + loopCounter].split(" "); // Split the current line.
      resultMatrix[tempTokens[0]][tempTokens[1]]++; // Increment the count at the specified coordinates.
    }
    this._currentLineIndex += numEntries; // Advance the line index by the number of entries read.
    return resultMatrix;
  },
};

// Global arrays for Disjoint Set Union (DSU) operations.
let parentArrayA = [];
let parentArrayB = [];

// Finds the representative (root) of the set containing 'elementIndex' using path compression.
function findRepresentative(disjointSet, elementIndex) {
  // If the element is its own parent, it's the root.
  if (disjointSet[elementIndex] === elementIndex) {
    return elementIndex;
  }
  // Otherwise, recursively find the root and compress the path.
  disjointSet[elementIndex] = findRepresentative(disjointSet, disjointSet[elementIndex]);
  return disjointSet[elementIndex];
}

// Checks if two elements 'firstElement' and 'secondElement' are in the same set.
function areConnected(disjointSet, firstElement, secondElement) {
  return findRepresentative(disjointSet, firstElement) === findRepresentative(disjointSet, secondElement);
}

// Unites the sets containing 'elementX' and 'elementY'.
function unionSets(disjointSet, elementX, elementY) {
  elementX = findRepresentative(disjointSet, elementX); // Find root of elementX.
  elementY = findRepresentative(disjointSet, elementY); // Find root of elementY.
  if (elementX === elementY) {
    return; // Already in the same set, nothing to do.
  }
  disjointSet[elementX] = elementY; // Make elementY's root the parent of elementX's root.
}

// Initialize the input processor with data from standard input.
let inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the main problem-solving function.
console.log(solveProblem());

// Main function to solve the problem.
function solveProblem() {
  // Read problem parameters: total elements, number of connections for set A, number of connections for set B.
  let totalElements = inputProcessor.extractToken();
  let numConnectionsK = inputProcessor.extractToken();
  let numConnectionsL = inputProcessor.extractToken();

  // Initialize both DSU arrays. Each element is initially its own parent.
  for (let loopIndex = 0; loopIndex <= totalElements; loopIndex++) {
    parentArrayA[loopIndex] = loopIndex;
    parentArrayB[loopIndex] = loopIndex;
  }

  // Process 'k' connections for the first DSU (parentArrayA).
  for (let loopIndex = 0; loopIndex < numConnectionsK; loopIndex++) {
    let currentPair = inputProcessor.extractLine(); // Read a pair of connected elements.
    unionSets(parentArrayA, currentPair[0], currentPair[1]); // Unite their sets.
  }

  // Process 'l' connections for the second DSU (parentArrayB).
  for (let loopIndex = 0; loopIndex < numConnectionsL; loopIndex++) {
    let currentPair = inputProcessor.extractLine(); // Read a pair of connected elements.
    unionSets(parentArrayB, currentPair[0], currentPair[1]); // Unite their sets.
  }

  // Arrays and objects to store intermediate results and the final answer.
  let combinedRoots = [];
  let frequencyMap = {};
  let finalAnswer = [];

  // For each element, find its root in both DSU structures and combine them into a unique key.
  // Then, count the frequency of each combined root key.
  for (let loopIndex = 0; loopIndex < totalElements; loopIndex++) {
    combinedRoots[loopIndex] = findRepresentative(parentArrayA, loopIndex + 1) + "," + findRepresentative(parentArrayB, loopIndex + 1);
    // Increment frequency or initialize if first occurrence.
    if (frequencyMap[combinedRoots[loopIndex]]) {
      frequencyMap[combinedRoots[loopIndex]]++;
    } else {
      frequencyMap[combinedRoots[loopIndex]] = 1;
    }
  }

  // Populate the final answer array with the frequency count for each element's combined root.
  for (let loopIndex = 0; loopIndex < totalElements; loopIndex++) {
    finalAnswer[loopIndex] = frequencyMap[combinedRoots[loopIndex]];
  }

  // Join the elements of the final answer array with spaces and return as a string.
  return finalAnswer.join(" ");
}
