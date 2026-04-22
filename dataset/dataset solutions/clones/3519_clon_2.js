/* This module defines a class for parsing input data. */
function InputReader(textSource) {
  // Initialize the internal buffer with lines from the provided source.
  this.sourceLines = textSource.split("\n");
  // Set the initial line cursor to the first line.
  this.currentLineIndex = 0;
}

InputReader.prototype = {
  // Method to extract a single token from the current line.
  extractNextToken: function(keepRaw) {
    let activeLines = this.sourceLines,
      readPosition = this.currentLineIndex,
      extractedElement; // Holds the parsed item.

    // If the current line is a string, split it into tokens.
    if (typeof activeLines[readPosition] === "string") {
      activeLines[readPosition] = activeLines[readPosition].split(" ").reverse();
    }

    // Pop the last token (which was the first due to reverse).
    extractedElement = activeLines[readPosition].pop();

    // If the current line is exhausted, advance the line cursor.
    if (!activeLines[readPosition].length) {
      this.currentLineIndex++;
    }

    // Return the token, either as raw string or converted to a number.
    return keepRaw ? extractedElement : +extractedElement;
  },

  // Method to read an entire line and parse its tokens.
  fetchLineData: function(isTextual) {
    // Retrieve and split the current line, then advance the cursor.
    const lineTokens = this.sourceLines[this.currentLineIndex++].split(" ");

    // Return tokens as strings or convert them to numbers.
    return isTextual ? lineTokens : lineTokens.map(item => +item);
  },

  // Method to read multiple lines and parse their tokens.
  readBlockData: function(batchSize, keepRaw) {
    let activeLines = this.sourceLines,
      readPosition = this.currentLineIndex,
      resultArray = [],
      loopCounter = 0; // Loop iterator.

    // Process lines based on whether raw strings or numbers are needed.
    if (keepRaw) {
      for (; loopCounter < batchSize; loopCounter++) {
        resultArray[loopCounter] = activeLines[readPosition + loopCounter].split(" ");
      }
    } else {
      for (; loopCounter < batchSize; loopCounter++) {
        resultArray[loopCounter] = activeLines[readPosition + loopCounter].split(" ").map(item => +item);
      }
    }

    // Advance the line cursor by the number of lines read.
    this.currentLineIndex += batchSize;
    return resultArray;
  },
};

// Create an instance of the InputReader to handle standard input.
const contentHandler = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the main processing function.
console.log(performCalculation());

/* This is the primary function that orchestrates data processing. */
function performCalculation() {
  // Read the total number of items from the input.
  const datasetSize = contentHandler.extractNextToken();
  // Read the coordinate pairs for all items.
  const pointData = contentHandler.readBlockData(datasetSize);

  // Determine the parity of the sum of coordinates for the first item.
  // Using bitwise AND 1 for efficient modulo 2.
  const initialParity = (pointData[0][0] + pointData[0][1]) & 1;

  // Validate parity consistency across all items.
  for (let iterIndex = 1; iterIndex < datasetSize; iterIndex++) {
    // Calculate parity for the current item.
    const currentParity = (pointData[iterIndex][0] + pointData[iterIndex][1]) & 1;
    // If any item's parity differs, return an error code.
    if (currentParity !== initialParity) return -1;
  }

  // Calculate the number of dimensions/steps based on the initial parity.
  // This value determines the length of movement vectors.
  const vectorLength = 20 - initialParity;

  // Create an array representing unit weights for each dimension.
  // All elements are initialized to 1.
  const dimensionWeights = Array(vectorLength).fill(1);

  // Initialize an array to store movement instructions for each point.
  const movementStrings = [];

  // Iterate through each point to generate its movement path.
  for (let iterIndex = 0; iterIndex < datasetSize; iterIndex++) {
    movementStrings[iterIndex] = ""; // Start with an empty path.
    // For each dimension/step, determine the movement direction.
    for (let stepCounter = 0; stepCounter < vectorLength; stepCounter++) {
      if (pointData[iterIndex][0] > 0) {
        pointData[iterIndex][0]--;
        movementStrings[iterIndex] += "R"; // Move Right
      } else if (pointData[iterIndex][0] < 0) {
        pointData[iterIndex][0]++;
        movementStrings[iterIndex] += "L"; // Move Left
      } else if (pointData[iterIndex][1] > 0) {
        pointData[iterIndex][1]--;
        movementStrings[iterIndex] += "U"; // Move Up
      } else {
        pointData[iterIndex][1]++;
        movementStrings[iterIndex] += "D"; // Move Down
      }
    }
  }

  // Construct the final output string: vector length, weights, and paths.
  return vectorLength + "\n" + dimensionWeights.join(" ") + "\n" + movementStrings.join("\n");
}