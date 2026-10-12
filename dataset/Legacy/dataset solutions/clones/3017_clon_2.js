var INPUT_PARSER_FACTORY = (function() {
  // This factory function creates an instance of the InputReader.
  function createInputReader(rawInputString) {
    return new InputReader(rawInputString);
  }

  // The InputReader class handles parsing the input text.
  function InputReader(inputContent) {
    // Split the entire input content into an array of individual lines.
    // Trim any leading/trailing whitespace from the whole input first.
    this._inputLines = inputContent.trim().split("\n");
    // Initialize a pointer to keep track of the current line being processed.
    this._currentLinePointer = 0;
  }

  // Prototype method to extract the next token from the current line.
  // It can return the token as a string or a number.
  InputReader.prototype.getNextValue = function(returnAsString) {
    var currentLineTokens = this._inputLines;
    var lineIndex = this._currentLinePointer;
    var extractedToken;

    // If the current line is still a raw string, split it into tokens and reverse
    // so that `pop()` can efficiently get tokens from the "front" of the line.
    if (typeof currentLineTokens[lineIndex] === "string") {
      currentLineTokens[lineIndex] = currentLineTokens[lineIndex].split(" ").reverse();
    }

    // Get the next token from the end of the reversed array (which is the start of the original line).
    extractedToken = currentLineTokens[lineIndex].pop();

    // If the current line's token array is now empty, advance the line pointer.
    if (!currentLineTokens[lineIndex].length) {
      this._currentLinePointer++;
    }

    // Return the token, converting to a number if 'returnAsString' is false/falsy.
    return returnAsString ? extractedToken : +extractedToken;
  };

  // Prototype method to read all tokens from the current line and advance the line pointer.
  InputReader.prototype.readCurrentLine = function(asStrings) {
    // Get the current line, split it by spaces, and then increment the line pointer.
    var lineTokens = this._inputLines[this._currentLinePointer++].split(" ");
    // Return the tokens, mapping them to numbers if 'asStrings' is false/falsy.
    return asStrings ? lineTokens : lineTokens.map(val => +val);
  };

  // Prototype method to read a specified number of lines as a matrix.
  InputReader.prototype.readMultiLineMatrix = function(numberOfRows, keepStrings) {
    // Extract 'numberOfRows' lines, split each into tokens, and then advance the line pointer.
    var matrixData = this._inputLines.slice(this._currentLinePointer, this._currentLinePointer += numberOfRows).map(line => line.split(" "));
    // Return the matrix, mapping inner arrays to numbers if 'keepStrings' is false/falsy.
    return keepStrings ? matrixData : matrixData.map(row => row.map(val => +val));
  };

  // Prototype method to read a specified number of raw lines.
  InputReader.prototype.readMultipleLines = function(lineCount, getStrings) {
    // Extract 'lineCount' lines directly and then advance the line pointer.
    var linesArray = this._inputLines.slice(this._currentLinePointer, this._currentLinePointer += lineCount);
    // Return the lines, mapping them to numbers if 'getStrings' is false/falsy.
    return getStrings ? linesArray : linesArray.map(val => +val);
  };

  // The factory returns the function to create an InputReader instance.
  return createInputReader;
})();

// Create an input reader instance by reading from standard input.
var inputReader = INPUT_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to create a multi-dimensional array initialized with a specific value.
// The dimensions are passed as subsequent arguments after the initial value.
function createMultiDimensionalArray(initialFillValue) {
  var dimensionArguments = arguments;
  var argCount = dimensionArguments.length;
  // Start building the array creation string from the innermost dimension.
  // `argCount` is decremented to get the last dimension argument's index.
  var arrayConstructionString = "Array(dimensionArguments[" + --argCount + "]).fill(initialFillValue)";
  // Loop backwards through the remaining dimension arguments to build the outer arrays.
  while (--argCount) {
    // Each outer array is filled with 0 initially, then mapped to create new inner arrays.
    arrayConstructionString = "Array(dimensionArguments[" + argCount + "]).fill(0).map(element => " + arrayConstructionString + ")";
  }
  // Evaluate the dynamically constructed string to create the multi-dimensional array.
  return eval(arrayConstructionString);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

// Main function containing the problem's logic.
function solveProblem() {
  // Read the length of the character sequence.
  var sequenceLength = inputReader.getNextValue();
  // Read the character sequence itself as a string.
  var charSequence = inputReader.getNextValue(true);

  // Initialize the minimum number of changes required to a very large value.
  var minimumChanges = 9e9; // A sufficiently large number to ensure any valid count will be smaller.

  // `prefixWhiteCounts[k]` will store the number of '#' characters from index 0 up to `k-1`.
  // Array size `sequenceLength + 1` to allow for `prefixWhiteCounts[0]` (0 whites) and `prefixWhiteCounts[sequenceLength]`.
  var prefixWhiteCounts = createMultiDimensionalArray(0, sequenceLength + 1);
  // `suffixBlackCounts[k]` will store the number of '.' characters from index `k` up to `sequenceLength-1`.
  // Array size `sequenceLength + 1` for similar boundary reasons.
  var suffixBlackCounts = createMultiDimensionalArray(0, sequenceLength + 1);

  // Calculate prefix sums for '#' characters.
  // `prefixWhiteCounts[charIndex + 1]` accumulates counts from `charSequence[0]` to `charSequence[charIndex]`.
  for (var charIndex = 0; charIndex < sequenceLength; charIndex++) {
    prefixWhiteCounts[charIndex + 1] = prefixWhiteCounts[charIndex]; // Carry over the count from the previous position.
    if (charSequence[charIndex] === "#") {
      prefixWhiteCounts[charIndex + 1]++; // Increment if the current character is '#'.
    }
  }

  // Calculate suffix sums for '.' characters.
  // The loop variable `charIndex` retains its value (`sequenceLength`) from the previous loop.
  // So, `charIndex - 1` correctly starts from `sequenceLength - 1`.
  // `suffixBlackCounts[charIndex]` accumulates counts from `charSequence[charIndex]` to `charSequence[sequenceLength - 1]`.
  for (var charIndex = charIndex - 1; charIndex >= 0; charIndex--) {
    suffixBlackCounts[charIndex] = suffixBlackCounts[charIndex + 1]; // Carry over the count from the next position.
    if (charSequence[charIndex] === ".") {
      suffixBlackCounts[charIndex]++; // Increment if the current character is '.'.
    }
  }

  // Iterate through all possible split points.
  // A split point `charIndex` means we consider changing characters from `0` to `charIndex-1` to `.`
  // and characters from `charIndex` to `sequenceLength-1` to `#`.
  // There are `sequenceLength + 1` possible split points (from before the first char to after the last char).
  for (var charIndex = 0; charIndex <= sequenceLength; charIndex++) {
    // The number of changes needed for the left part (0 to charIndex-1) is the count of '#' in that segment.
    // This is given by `prefixWhiteCounts[charIndex]`.
    // The number of changes needed for the right part (charIndex to sequenceLength-1) is the count of '.' in that segment.
    // This is given by `suffixBlackCounts[charIndex]`.
    var currentTotalChanges = prefixWhiteCounts[charIndex] + suffixBlackCounts[charIndex];

    // Update the minimum changes if the current configuration yields fewer changes.
    if (currentTotalChanges < minimumChanges) {
      minimumChanges = currentTotalChanges;
    }
  }

  // Return the overall minimum number of changes required.
  return minimumChanges;
}
