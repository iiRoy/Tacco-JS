var inputReaderInstance = initializeInputReader();

executeMainLogic();

function readInteger() {
  return dataConverter(readNextLine(), 1);
}

function readStringArray() {
  return dataConverter(readNextLine(), 2);
}

function readIntegerArray() {
  return dataConverter(readNextLine(), 4);
}

function readCharacterArray() {
  return dataConverter(readNextLine(), 6);
}

function readNextLine() {
  return inputReaderInstance.readNextLine();
}

function hasMoreLines() {
  return inputReaderInstance.hasMoreLines();
}

function initializeInputReader() {
  function readInputFile() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
  }

  var rawInputLines = readInputFile();
  var readerInstance = {
    "inputLines": rawInputLines,
    "currentIndex": 0,
    "maxIndex": rawInputLines.length,
    "hasMoreLines": function() {
      return (this.currentIndex < this.maxIndex);
    },
    "readNextLine": function() {
      if (!this.hasMoreLines()) {
        return "";
      } else {
        var currentLine = this.inputLines[this.currentIndex];
        this.currentIndex++;
        return currentLine;
      }
    }
  };
  return readerInstance;
}

function printOutput(messageContent) {
  console.log(messageContent);
}

function printError(messageContent) {
  console.error(messageContent);
}

function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(function(itemValue) {
          return Number(itemValue);
        });
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(function(itemValue) {
          return Number(itemValue);
        });
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

function executeMainLogic() {
  var inputCount = readInteger();
  var dataList = readIntegerArray();

  function performInitialValidation(countVal, listVal) {
    for (var idx = 0; idx < countVal; idx++) {
      var expectedMinVal = idx + 1;
      if (listVal[idx] > expectedMinVal) {
        return false;
      }
    }
    return true;
  }

  if (!performInitialValidation(inputCount, dataList)) {
    printOutput(-1);
    return;
  }

  var resultSequence = [];
  var currentPosition = 0;

  function handleMismatch(currentList, currentIdx, outputArr) {
    var valueToUnshift = currentList[currentIdx - 1];
    outputArr.unshift(valueToUnshift);
    currentList.splice(currentIdx - 1, 1);
    return 0;
  }

  while (dataList.length > 0) {
    var currentValue = dataList[currentPosition];
    var targetValue = currentPosition + 1;

    if (currentValue === targetValue) {
      currentPosition++;
    } else {
      if (currentValue < targetValue) {
        currentPosition = handleMismatch(dataList, currentPosition, resultSequence);
      } else {
        printOutput(-1);
        return;
      }
    }
  }

  printOutput(dataConverter(resultSequence, 9));
}
