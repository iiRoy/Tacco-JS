var INPUT_PARSER = (function () {
  // This function serves as a factory to create an input reader instance.
  function createInputReader(sourceText) {
    return new InputReader(sourceText);
  }

  // The InputReader class manages parsing input text line by line.
  function InputReader(rawInputString) {
    // Internal buffer for lines, split by newline and trimmed.
    this._lineBuffer = rawInputString.trim().split("\n");
    // Current index indicating the line being processed.
    this._currentLineIndex = 0;
  }

  // Method to extract a single value from the current line.
  // It reads from the end of the line, reversing the line's words if needed.
  InputReader.prototype.readSingleValue = function (asString) {
    var bufferRef = this._lineBuffer;
    var currentIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line hasn't been processed into an array of words yet, do so.
    if (typeof bufferRef[currentIdx] === "string") {
      bufferRef[currentIdx] = bufferRef[currentIdx].split(" ").reverse();
    }

    // Pop the last element (which is the first word after reversing).
    extractedValue = bufferRef[currentIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!bufferRef[currentIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value as a string or convert it to a number.
    return asString ? extractedValue : +extractedValue;
  };

  // Method to read all values from the current line.
  // Advances the line index after reading.
  InputReader.prototype.readLineValues = function (asString) {
    // Split the current line by spaces and then increment the line index.
    var lineData = this._lineBuffer[this._currentLineIndex++].split(" ");
    // Return the array of values as strings or numbers.
    return asString ? lineData : lineData.map((item) => +item);
  };

  // Method to read 'count' lines and parse them into a matrix (2D array).
  // Advances the line index by 'count'.
  InputReader.prototype.readMatrix = function (count, asString) {
    // Slice 'count' lines from the buffer and split each into words.
    var resultData = this._lineBuffer
      .slice(this._currentLineIndex, (this._currentLineIndex += count))
      .map((item) => item.split(" "));
    // Return the matrix of values as strings or numbers.
    return asString
      ? resultData
      : resultData.map((row) => row.map((item) => +item));
  };

  // Method to read 'count' lines as raw strings or convert them to numbers.
  // Advances the line index by 'count'.
  InputReader.prototype.readRawLines = function (count, asString) {
    // Slice 'count' lines directly from the buffer.
    var resultData = this._lineBuffer.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    // Return the array of lines as strings or numbers.
    return asString ? resultData : resultData.map((item) => +item);
  };

  return createInputReader; // Expose the factory function.
})();

// Create an instance of the input reader, reading from standard input.
var inputSource = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Log the result of the main calculation function.
console.log(calculateProbability());

// Main function to perform the probability calculation.
function calculateProbability() {
  // Read the total number of items.
  var totalItems = inputSource.readSingleValue();
  // Read the array of probabilities.
  var probabilities = inputSource.readLineValues();

  // Initialize the dynamic programming array.
  // dp[k] will store the probability of having exactly k successes.
  // For the first item (index 0), we have 1-p[0] for 0 successes and p[0] for 1 success.
  var dynamicProbabilities = [1 - probabilities[0], probabilities[0]];

  // Iterate through the remaining items starting from the second item.
  for (var outerLoopIndex = 1; outerLoopIndex < totalItems; outerLoopIndex++) {
    // When considering the current item (probabilities[outerLoopIndex]):
    // The probability of having (outerLoopIndex + 1) successes
    // can only come from having 'outerLoopIndex' successes before,
    // and the current item being a success.
    dynamicProbabilities[outerLoopIndex + 1] =
      dynamicProbabilities[outerLoopIndex] * probabilities[outerLoopIndex];

    // Update probabilities for 'j' successes (where j is from outerLoopIndex down to 1).
    // A state of 'j' successes can be reached by:
    // 1. Having 'j-1' successes before AND the current item being a success.
    // 2. Having 'j' successes before AND the current item being a failure.
    for (var innerLoopIndex = outerLoopIndex; innerLoopIndex > 0; innerLoopIndex--) {
      dynamicProbabilities[innerLoopIndex] =
        dynamicProbabilities[innerLoopIndex - 1] * probabilities[outerLoopIndex] +
        dynamicProbabilities[innerLoopIndex] * (1 - probabilities[outerLoopIndex]);
    }

    // Update probability for 0 successes.
    // This can only happen if there were 0 successes before AND the current item is a failure.
    // Note: innerLoopIndex will be 0 after the inner loop completes.
    dynamicProbabilities[0] =
      dynamicProbabilities[innerLoopIndex] * (1 - probabilities[outerLoopIndex]);
  }

  // Calculate the final answer: sum of probabilities for at least (totalItems + 1) / 2 successes.
  var finalProbabilitySum = 0;
  for (
    outerLoopIndex = (totalItems + 1) / 2;
    outerLoopIndex <= totalItems;
    outerLoopIndex++
  ) {
    finalProbabilitySum += dynamicProbabilities[outerLoopIndex];
  }

  return finalProbabilitySum;
}
