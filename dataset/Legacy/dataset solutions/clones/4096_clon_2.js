var INPUT_PARSER = (function() {
  // This function serves as the factory for creating an InputReader instance.
  function createParser(sourceContent) {
    return new InputReader(sourceContent);
  }

  // The InputReader class handles parsing various types of input from a string.
  function InputReader(rawInputString) {
    // Store the input string, split into individual lines, and remove leading/trailing whitespace.
    this.lineData = rawInputString.trim().split("\n");
    // Initialize the current line index to 0.
    this.currentLineIndex = 0;
  }

  // Reads a single token (space-separated value) from the current line.
  // If 'asString' is true, returns the token as a string; otherwise, converts it to a number.
  InputReader.prototype.readToken = function(asString) {
    var lineDataRef = this.lineData;
    var lineIdx = this.currentLineIndex;
    var tokenValue;

    // If the current line hasn't been processed into tokens yet, split it and reverse for efficient popping.
    if (typeof lineDataRef[lineIdx] === "string") {
      lineDataRef[lineIdx] = lineDataRef[lineIdx].split(" ").reverse();
    }

    // Extract the last token from the current line's array.
    tokenValue = lineDataRef[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineDataRef[lineIdx].length) {
      this.currentLineIndex++;
    }

    // Return the token, either as a string or a number.
    return asString ? tokenValue : +tokenValue;
  };

  // Reads an entire line, splitting it into space-separated tokens.
  // If 'asStrings' is true, returns an array of strings; otherwise, an array of numbers.
  InputReader.prototype.readLine = function(asStrings) {
    var lineTokens = this.lineData[this.currentLineIndex++].split(" ");
    return asStrings ? lineTokens : lineTokens.map(item => +item);
  };

  // Reads 'numRows' lines, treating each as a row in a matrix, splitting by spaces.
  // If 'asStringMatrix' is true, returns a matrix of strings; otherwise, a matrix of numbers.
  InputReader.prototype.readMatrix = function(numRows, asStringMatrix) {
    var matrixRows = this.lineData.slice(this.currentLineIndex, this.currentLineIndex += numRows).map(row => row.split(" "));
    return asStringMatrix ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  // Reads 'count' lines without further splitting.
  // If 'asStringArray' is true, returns an array of strings; otherwise, an array of numbers.
  InputReader.prototype.readLines = function(count, asStringArray) {
    var lineArray = this.lineData.slice(this.currentLineIndex, this.currentLineIndex += count);
    return asStringArray ? lineArray : lineArray.map(item => +item);
  };

  return createParser;
})();

// Initialize the input source by reading from standard input.
var inputSource = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main logic and print the result to the console.
console.log(processMainLogic());

// The primary function containing the problem's solution.
function processMainLogic() {
  // Read the initial index and adjust it for zero-based indexing.
  var currentIndex = inputSource.readToken() - 1;
  // Read the sequence of numbers from the next line.
  var numberSequence = inputSource.readLine();

  // Check a specific condition at the adjusted index.
  // The index is decremented after access.
  if (numberSequence[currentIndex--] !== 2) {
    return -1; // Return -1 if the condition is not met.
  }

  // Initialize lower and upper bounds for the calculation.
  var upperBound = 3;
  var lowerBound = 2;

  // Iterate backwards through the number sequence.
  for (; currentIndex >= 0; currentIndex--) {
    // If a number in the sequence exceeds the current upper bound, return -1.
    if (numberSequence[currentIndex] > upperBound) {
      return -1;
    }

    // Update the lower bound using ceiling division.
    lowerBound = numberSequence[currentIndex] * Math.ceil(lowerBound / numberSequence[currentIndex]);
    // Update the upper bound using a combination of ceiling division and max.
    upperBound = Math.max((numberSequence[currentIndex] * Math.ceil(upperBound / numberSequence[currentIndex])), lowerBound + numberSequence[currentIndex]) - 1;
  }

  // Return the final lower and upper bounds as a space-separated string.
  return lowerBound + " " + upperBound;
}
