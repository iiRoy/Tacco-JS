var inputReader = initializeDataProcessor();

executePrimaryLogic();

/**
 * Retrieves an integer value from the input stream.
 * @returns {number} The next integer.
 */
function retrieveIntegerValue() {
  return transformData(fetchNextEntry(), 1);
}

/**
 * Reads the next line and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
function retrieveStringArray() {
  return transformData(fetchNextEntry(), 2);
}

/**
 * Reads the next line, splits it by space, and converts elements to numbers.
 * @returns {number[]} An array of integers.
 */
function retrieveIntegerArray() {
  return transformData(fetchNextEntry(), 4);
}

/**
 * Reads the next line and splits it into an array of single characters.
 * @returns {string[]} An array of characters.
 */
function retrieveCharacterArray() {
  return transformData(fetchNextEntry(), 6);
}

/**
 * Fetches the next available entry from the input source.
 * @returns {string} The next input line.
 */
function fetchNextEntry() {
  return inputReader.fetchNextEntry();
}

/**
 * Checks if there are more entries available in the input.
 * @returns {boolean} True if more entries exist, false otherwise.
 */
function hasFurtherEntries() {
  return inputReader.hasFurtherEntries();
}

/**
 * Reads all input from standard input, trims it, and splits it into lines.
 * @returns {string[]} An array of input lines.
 */
function readSystemInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

/**
 * Sets up the input processing object.
 * @returns {object} An object with input handling methods.
 */
function initializeDataProcessor() {
  var sourceLines = readSystemInput();
  var processorInstance = {
    "contentList": sourceLines,
    "currentPosition": 0,
    "maximumCount": sourceLines.length,
    "hasFurtherEntries": function() {
      return (this.currentPosition < this.maximumCount);
    },
    "fetchNextEntry": function() {
      if (!this.hasFurtherEntries()) {
        return "";
      } else {
        var extractedData = this.contentList[this.currentPosition];
        this.currentPosition++;
        return extractedData;
      }
    }
  };
  return processorInstance;
}

/**
 * Outputs content to the standard output stream.
 * @param {*} resultContent - The data to be displayed.
 */
function displayOutput(resultContent) {
  console.log(resultContent);
}

/**
 * Outputs messages to the standard error stream.
 * @param {*} issueDetails - The error information to be reported.
 */
function reportError(issueDetails) {
  console.error(issueDetails);
}

/**
 * Transforms the input data based on the specified type.
 * Transformation type legend:
 *   1: Convert to integer.
 *   2: Split by single space into string array.
 *   4: Split by single space and convert to number array.
 *   6: Split into individual characters.
 *   7: Split into individual characters and convert to number array.
 *   8: Join array elements with a single space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any separator.
 * Default: Returns input as is.
 * @param {*} inputItem - The data to transform.
 * @param {number} transformationType - The type of transformation to apply.
 * @returns {*} The transformed data.
 */
function transformData(inputItem, transformationType) {
  try {
    switch (transformationType) {
      case 1:
        return parseInt(inputItem);
      case 2:
        return inputItem.split(" ");
      case 4:
        return inputItem.split(" ").map((itemValue) => Number(itemValue));
      case 6:
        return inputItem.split("");
      case 7:
        return inputItem.split("").map((itemValue) => Number(itemValue));
      case 8:
        return inputItem.join(" ");
      case 9:
        return inputItem.join("\n");
      case 0:
        return inputItem.join("");
      default:
        return inputItem;
    }
  } catch (processingError) {
    return inputItem;
  }
}

/**
 * The primary execution logic of the program.
 * Calculates the sum of differences after sorting and removing the largest.
 */
function executePrimaryLogic() {
  var firstLineValues = retrieveIntegerArray();
  var boundaryValue = firstLineValues[0];
  var elementCount = firstLineValues[1];

  var originalSequence = retrieveIntegerArray();

  var differenceArray = new Array(elementCount);

  for (var idx = 0; idx < elementCount - 1; idx++) {
    differenceArray[idx] = originalSequence[idx + 1] - originalSequence[idx];
  }

  differenceArray[elementCount - 1] = (boundaryValue - originalSequence[elementCount - 1]) + originalSequence[0];

  reportError(differenceArray);

  differenceArray.sort(function(valA, valB) {
    return valA - valB;
  });

  differenceArray.pop();

  var totalSum = 0;
  for (var idx = 0; idx < elementCount - 1; idx++) {
    totalSum += differenceArray[idx];
  }

  displayOutput(totalSum);
}