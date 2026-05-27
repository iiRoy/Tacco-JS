var INPUT_PARSER = (function() {
  // This factory function creates and returns a new instance of the DataStreamReader.
  function createParser(inputString) {
    return new DataStreamReader(inputString);
  }

  // The constructor for our custom data stream reader.
  function DataStreamReader(inputString) {
    // Stores the input, split into an array of lines after trimming whitespace.
    this.lineBuffer = inputString.trim().split("\n");
    // Keeps track of the current line being processed.
    this.currentLineIndex = 0;
  }

  // Reads a single token from the current line.
  // If 'asString' is true, the token is returned as a string; otherwise, it's converted to a number.
  DataStreamReader.prototype.readToken = function(asString) {
    var bufferRef = this.lineBuffer;
    var lineIdx = this.currentLineIndex;
    var tokenValue;

    // If the current line is still a raw string, split it into words and reverse the array.
    // This allows popping tokens from the "front" of the original line.
    if (typeof bufferRef[lineIdx] === "string") {
      bufferRef[lineIdx] = bufferRef[lineIdx].split(" ").reverse();
    }

    // Extract the last element (which is the first word of the original line due to reversal).
    tokenValue = bufferRef[lineIdx].pop();

    // If the current line has no more tokens, advance to the next line.
    if (!bufferRef[lineIdx].length) {
      this.currentLineIndex++;
    }

    // Return the token, optionally converting it to a number.
    return asString ? tokenValue : +tokenValue;
  };

  // Reads an entire line, splitting it into an array of tokens.
  // If 'asStrings' is true, tokens are strings; otherwise, they are numbers.
  DataStreamReader.prototype.readLine = function(asStrings) {
    // Get the current line, split by spaces, and then increment the line index.
    var lineTokens = this.lineBuffer[this.currentLineIndex++].split(" ");
    // Return the array of tokens, mapping to numbers if 'asStrings' is false.
    return asStrings ? lineTokens : lineTokens.map(item => +item);
  };

  // Reads 'numRows' lines and processes them into a 2D array (matrix).
  // Each row is split into tokens. 'asStrings' determines token type.
  DataStreamReader.prototype.readMatrix = function(numRows, asStrings) {
    // Extract a slice of lines, then map each line to an array of its split tokens.
    var matrixData = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex += numRows).map(row => row.split(" "));
    // If not returning strings, map all inner tokens to numbers.
    return asStrings ? matrixData : matrixData.map(row => row.map(item => +item));
  };

  // Reads 'count' lines and returns them as a 1D array.
  // If 'asStrings' is true, lines are strings; otherwise, they are numbers.
  DataStreamReader.prototype.readLines = function(count, asStrings) {
    // Extract a slice of lines from the buffer.
    var lineArray = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex += count);
    // Return the array, mapping to numbers if 'asStrings' is false.
    return asStrings ? lineArray : lineArray.map(lineContent => +lineContent);
  };

  return createParser;
})();

// Initialize the input reader by reading the entire content of /dev/stdin.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving function and print its result to the console.
console.log(solveProblem());

// The primary function containing the solution logic.
function solveProblem() {
  // Read the single input string from the data stream.
  var inputStringValue = inputReader.readToken(true);
  // Define the target pattern string to search for.
  var targetPattern = "keyence";
  // Initialize the default outcome if no match is found.
  var defaultOutcome = "NO";

  // Iterate through all possible split points within the target pattern.
  // This creates prefixes and suffixes to form a regex pattern.
  for (var splitIndex = 0; splitIndex <= targetPattern.length; splitIndex++) {
    // Construct a regular expression: "^" + prefix + ".*" + suffix + "$".
    // This checks if the input string starts with the prefix, ends with the suffix,
    // and has any characters in between.
    if (inputStringValue.match("^" + targetPattern.slice(0, splitIndex) + ".*" + targetPattern.slice(splitIndex) + "$")) {
      return "YES"; // If a match is found, immediately return "YES".
    }
  }

  // If the loop completes without finding any match, return the default outcome.
  return defaultOutcome;
}
