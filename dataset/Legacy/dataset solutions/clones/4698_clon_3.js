var inputHandler = initializeInputReader();
processInput();

function readInteger() {
  return convertInput(getNextLine(), 1);
}

function readStringArray() {
  return convertInput(getNextLine(), 2);
}

function readIntegerArray() {
  return convertInput(getNextLine(), 4);
}

function readCharacterArray() {
  return convertInput(getNextLine(), 6);
}

function getNextLine() {
  return inputHandler.retrieveNextLine();
}

function hasMoreLines() {
  return inputHandler.checkMoreLines();
}

function getInputContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputReader() {
  var rawInputLines = getInputContent();
  var totalLinesCount = rawInputLines.length;
  var currentLinePointer = 0;

  var readerInstance = {
    "lineBuffer": rawInputLines,
    "currentLineIndex": currentLinePointer,
    "totalLines": totalLinesCount,
    "checkMoreLines": function() {
      return (this.currentLineIndex < this.totalLines);
    },
    "retrieveNextLine": function() {
      if (!this.checkMoreLines()) {
        throw "ArrayIndexOutOfBoundsException: No more input lines available.";
      }
      var lineToReturn = this.lineBuffer[this.currentLineIndex];
      this.currentLineIndex++;
      return lineToReturn;
    }
  };
  return readerInstance;
}

function printResult(data) {
  console.log(data);
}

function printError(data) {
  console.error(data);
}

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10);
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
  } catch (e) {
    return inputValue;
  }
}

function processInput() {
  var calculatedOutput = 0;
  var inputLineOne = readIntegerArray();
  var valueN = inputLineOne[0];
  var valueM = inputLineOne[1];

  var halfOfM = valueM / 2;
  var doubledN = valueN * 2;

  if (valueN >= halfOfM) {
    calculatedOutput = Math.floor(halfOfM);
  } else {
    var remainingMAfterNContribution = valueM - doubledN;
    var quarterOfRemainingM = remainingMAfterNContribution / 4;
    calculatedOutput = Math.floor(valueN + quarterOfRemainingM);
  }
  printResult(calculatedOutput);
}
