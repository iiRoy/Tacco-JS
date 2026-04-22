var inputSource = initializeInputReader();
executeProgram();
function readNumericValue() {
  return transformData(fetchNextLine(), 1);
}
function readStringArray() {
  return transformData(fetchNextLine(), 2);
} // Splits input string by a single space character.
function readNumericArray() {
  return transformData(fetchNextLine(), 4);
} // Splits by space, then converts each part to a number.
function readCharacterArray() {
  return transformData(fetchNextLine(), 6);
} // Divides the string into an array of individual characters.
function fetchNextLine() {
  return inputSource.fetchNextLine();
}
function hasMoreLines() {
  return inputSource.hasMoreLines();
}
function getRawInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}
function initializeInputReader() {
  var rawLines = getRawInput();
  var readerInstance = {
    lineBuffer: rawLines,
    currentPosition: 0,
    totalLines: rawLines.length,
    hasMoreLines: function() {
      return (this.currentPosition < this.totalLines);
    },
    fetchNextLine: function() {
      if (!this.hasMoreLines()) {
        return "";
      } else {
        var fetchedLine = this.lineBuffer[this.currentPosition];
        this.currentPosition++;
        return fetchedLine;
      }
    }
  };
  return readerInstance;
}
function displayResult(messageContent) {
  console.log(messageContent);
} // Prints output to the standard console.
function reportError(messageContent) {
  console.error(messageContent);
} // Sends diagnostic messages to the error console.
/*
  This function handles various data transformations based on the provided operation code.
  - If the operation code is unrecognized or an error occurs, the input value is returned unchanged.
  - Code 1: Converts the input string to an integer.
  - Code 2: Splits the input string into an array using a space as a delimiter.
  - Code 4: Splits the input string by spaces, then converts each resulting substring to a number.
  - Code 6: Splits the input string into an array of single characters.
  - Code 7: Splits the input string into characters, then converts each character to a number.
  - Code 8: Joins array elements into a string, separated by a single space.
  - Code 9: Joins array elements into a string, with each element on a new line.
  - Code 0: Joins array elements into a single string without any separator.
*/
function transformData(inputValue, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((element) => Number(element));
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
  var datasetSize = readNumericValue();
  var dataElements = readNumericArray();
  for (var iterationIndex = 0; iterationIndex < datasetSize; iterationIndex++) {
    if (dataElements[iterationIndex] > (iterationIndex + 1)) {
      // Logic check: A value at position 'x' should not be greater than 'x+1'.
      displayResult(-1);
      return;
    }
  }
  var resultCollection = [];
  var currentCheckIndex = 0;
  while (dataElements.length > 0) {
    if (dataElements[currentCheckIndex] == currentCheckIndex + 1) {
      currentCheckIndex++;
    } else {
      if (dataElements[currentCheckIndex] < currentCheckIndex + 1) {
        resultCollection.unshift(dataElements[currentCheckIndex - 1]);
        dataElements.splice(currentCheckIndex - 1, 1);
        currentCheckIndex = 0;
      } else {
        displayResult(-1);
        return;
      }
    }
  }
  displayResult(transformData(resultCollection, 9));
}