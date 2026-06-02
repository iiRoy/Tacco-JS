var inputHandler = initializeInputReader();
executeProgram();

function retrieveInteger() {
  return performConversion(getNextLine(), 1);
}

function retrieveStringArray() {
  return performConversion(getNextLine(), 2);
}

function retrieveIntegerArray() {
  return performConversion(getNextLine(), 4);
}

function retrieveCharacterArray() {
  return performConversion(getNextLine(), 6);
}

function getNextLine() {
  return inputHandler.fetchNext();
}

function hasMoreLines() {
  return inputHandler.checkNext();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputReader() {
  var rawInputData = readInputFile();
  var readerObject = {
    "dataLines": rawInputData,
    "currentLineIndex": 0,
    "totalLines": rawInputData.length,
    "checkNext": function() {
      return (this.currentLineIndex < this.totalLines);
    },
    "fetchNext": function() {
      if (!this.checkNext()) {
        return "";
      } else {
        var currentInputLine = this.dataLines[this.currentLineIndex];
        this.currentLineIndex++;
        return currentInputLine;
      }
    }
  };
  return readerObject;
}

function printOutput(value) {
  console.log(value);
}

function printError(value) {
  console.error(value);
}

function performConversion(inputValue, conversionType) {
  try {
    switch (conversionType) {
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
  } catch (error) {
    return inputValue;
  }
}

function executeProgram() {
  var countElements = retrieveInteger();
  var dataCollection = retrieveIntegerArray();

  for (var loopIndex = 0; loopIndex < countElements; loopIndex++) {
    if (dataCollection[loopIndex] > (loopIndex + 1)) {
      printOutput(-1);
      return;
    }
  }

  var resultSequence = [];
  var currentPosition = 0;

  while (dataCollection.length > 0) {
    if (dataCollection[currentPosition] === currentPosition + 1) {
      currentPosition++;
    } else {
      if (dataCollection[currentPosition] < currentPosition + 1) {
        resultSequence.unshift(dataCollection[currentPosition - 1]);
        dataCollection.splice(currentPosition - 1, 1);
        currentPosition = 0;
      } else {
        printOutput(-1);
        return;
      }
    }
  }

  printOutput(performConversion(resultSequence, 9));
}
