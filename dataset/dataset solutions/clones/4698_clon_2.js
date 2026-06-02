var inputHandler = initializeInput();
executeProgram();

function retrieveInteger() {
  return transformInput(fetchNextLine(), 1);
}

function retrieveStringArray() {
  return transformInput(fetchNextLine(), 2);
}

function retrieveIntegerArray() {
  return transformInput(fetchNextLine(), 4);
}

function retrieveCharacterArray() {
  return transformInput(fetchNextLine(), 6);
}

function fetchNextLine() {
  return inputHandler.next();
}

function hasMoreLines() {
  return inputHandler.hasMoreLines();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInput() {
  var fileContentLines = readInputFile();
  var inputProcessor = {
    lineBuffer: fileContentLines,
    currentLineIndex: 0,
    totalLines: fileContentLines.length,
    hasMoreLines: function () {
      return this.currentLineIndex < this.totalLines;
    },
    next: function () {
      if (!this.hasMoreLines()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentLineData = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineData;
      }
    },
  };
  return inputProcessor;
}

function displayOutput(content) {
  console.log(content);
}

function displayError(message) {
  console.error(message);
}

// This function handles various input transformations based on the conversionType.
// conversionType:
//   1: Convert to integer.
//   2: Split by space into a string array.
//   4: Split by space and convert to an array of numbers.
//   6: Split into a character array.
//   7: Split into a character array and convert to an array of numbers.
//   8: Join array elements with spaces.
//   9: Join array elements with newlines.
//   0: Join array elements without any separator.
//   Default: Return input as is.
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((item) => Number(item));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((item) => Number(item));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (conversionError) {
    return inputValue;
  }
}

function executeProgram() {
  var finalResult = 0;
  var firstLineData = retrieveIntegerArray();
  var valueN = firstLineData[0];
  var valueM = firstLineData[1];

  if (valueN >= valueM / 2) {
    finalResult = Math.floor(valueM / 2);
  } else {
    finalResult = Math.floor(valueN + (valueM - valueN * 2) / 4);
  }

  displayOutput(finalResult);
}
