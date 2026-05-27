"use strict";

// A utility class for parsing input strings line by line, token by token.
function InputParser(sourceText, typeConverter) {
  // Store the input text split into an array of lines.
  this.sourceLines = sourceText.split("\n");
  // Current token index within the current line.
  this.currentColumnIndex = 0;
  // Current line index.
  this.currentLineIndex = 0;
  // Default function to convert tokens (e.g., Number).
  this.defaultConverter = typeConverter || Number;
}

// Prototype method to read the next token from the input.
InputParser.prototype.readNextToken = function(customConverter) {
  // Get the current line content based on the current line index.
  let currentLineContent = this.sourceLines[this.currentLineIndex];

  // If the current line exists (not undefined or null).
  if (currentLineContent) {
    // Trim whitespace from the line and split it into parts (tokens) by space.
    let lineParts = currentLineContent.trim().split(" ");
    // Retrieve the token at the current column index.
    let tokenValue = lineParts[this.currentColumnIndex];

    // Increment the column index to point to the next token for the next read.
    this.currentColumnIndex++;

    // Check if all tokens in the current line have been processed.
    if (lineParts.length === this.currentColumnIndex) {
      // Reset the column index to 0 and advance to the next line.
      this.currentColumnIndex = 0;
      this.currentLineIndex++;
    }

    // Convert the token value using the provided custom converter, or the default one if no custom converter is given.
    return customConverter ? customConverter(tokenValue) : this.defaultConverter(tokenValue);
  }
};

// Prototype method to read all tokens from the current line as an array.
InputParser.prototype.readLineTokens = function(lineTokenConverter) {
  // Get the content of the current line.
  let lineData = this.sourceLines[this.currentLineIndex];

  // If the line content is valid.
  if (lineData) {
    // Reset the column index as we are reading a whole new line, and move to the next line.
    this.currentColumnIndex = 0;
    this.currentLineIndex++;
    // Split the line into tokens and map each token using the specified converter or the default one.
    return lineData.split(" ").map(lineTokenConverter || this.defaultConverter);
  }
};

// Export the InputParser class for use in other modules.
module.exports = InputParser;

// Define a constant for the modulo operation, as specified in the problem.
const moduloConstant = 1000003;

// Main function to process the entire input data.
function processInputData(rawData) {
  // Create an instance of the InputParser to facilitate reading tokens from the raw input string.
  let dataStream = new InputParser(rawData);

  // Read the first token, which represents the total number of queries (Q).
  let queryCount = dataStream.readNextToken();

  // Loop through each query, from 0 up to (but not including) the total query count.
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    // For each query, read three integer parameters: x, d, and n.
    let startValue = dataStream.readNextToken();
    let difference = dataStream.readNextToken();
    let termCount = dataStream.readNextToken();

    // Check a specific condition: if 'n' (termCount) is greater than or equal to the modulo constant.
    // If this condition is met, the product will necessarily include a term that is a multiple of 'mod',
    // or the product will contain 'mod' as a factor, making the final result modulo 'mod' equal to 0.
    if (termCount >= moduloConstant) {
      console.log(0); // Output 0 directly.
    } else {
      // Initialize a variable to accumulate the product of the series terms.
      let resultAccumulator = 1;

      // Calculate the product of the series: x * (x+d) * (x+2d) * ... * (x+(n-1)d).
      // The loop runs 'n' times, for k from 0 to n-1.
      for (let termIndex = 0; termIndex < termCount; termIndex++) {
        // Multiply the current accumulated result by the next term in the arithmetic progression.
        resultAccumulator *= (startValue + termIndex * difference);
        // Apply the modulo operation at each step to prevent integer overflow and keep the numbers manageable.
        resultAccumulator %= moduloConstant;
      }
      // After calculating the product for all 'n' terms, print the final result.
      console.log(resultAccumulator);
    }
  }
}

// Read the input from standard input using Node.js's file system module.
// The input is read synchronously and decoded as UTF-8, then passed to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
