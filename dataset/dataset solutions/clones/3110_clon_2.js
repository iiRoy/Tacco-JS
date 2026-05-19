var dataHandler = initializeInputProcessor();

executePrimaryLogic();

function retrieveInteger() {
  return performConversion(fetchNextLine(), 0x1);
}

function retrieveStringArray() {
  return performConversion(fetchNextLine(), 0x2);
} // Splits by space

function retrieveIntegerArray() {
  return performConversion(fetchNextLine(), 0x4);
} // Splits by space and converts to numbers

function retrieveCharacterArray() {
  return performConversion(fetchNextLine(), 0x6);
} // Splits by character

function fetchNextLine() {
  return dataHandler.getNextItem();
}

function hasMoreItems() {
  return dataHandler.checkMoreItems();
}

function readStandardInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputProcessor() {
  var inputLines = readStandardInput();
  var processorInstance = {
    "lineCollection": inputLines,
    "currentLineIndex": 0x0,
    "maximumLines": inputLines.length,
    "checkMoreItems": function() {
      return (this.currentLineIndex < this.maximumLines);
    },
    "getNextItem": function() {
      if (!this.checkMoreItems()) {
        return "";
      } else {
        var currentInputLine = this.lineCollection[this.currentLineIndex];
        this.currentLineIndex++;
        return currentInputLine;
      }
    }
  };
  return processorInstance;
}

function outputResult(contentToLog) {
  console.log(contentToLog);
} // Standard output

function outputError(errorMessage) {
  console.error(errorMessage);
} // Standard error output

// Conversion utility function
// [conversionType] parameter:
// 0x1: Convert to integer
// 0x2: Split by space
// 0x4: Split by space and map to numbers
// 0x6: Split by character
// 0x7: Split by character and map to numbers
// 0x8: Join array with space
// 0x9: Join array with newline
// 0x0: Join array without separator
// Default: Return input as is
function performConversion(inputData, conversionType) {
  try {
    switch (conversionType) {
      case 0x1:
        return parseInt(inputData);
      case 0x2:
        return inputData.split(" ");
      case 0x4:
        return inputData.split(" ").map((val) => Number(val));
      case 0x6:
        return inputData.split("");
      case 0x7:
        return inputData.split("").map((val) => Number(val));
      case 0x8:
        return inputData.join(" ");
      case 0x9:
        return inputData.join("\n");
      case 0x0:
        return inputData.join("");
      default:
        return inputData;
    }
  } catch (conversionError) {
    return inputData;
  }
}

function executePrimaryLogic() {
  var itemCount = retrieveInteger();
  var valueList = retrieveIntegerArray();

  for (var idx = 0x0; idx < itemCount; idx++) {
    if (valueList[idx] > (idx + 0x1)) {
      // If the value at index 'idx' is greater than 'idx + 1', it's an invalid sequence.
      outputResult(-0x1);
      return;
    }
  }

  var resultSequence = [];
  var currentPosition = 0x0;

  while (valueList.length > 0x0) {
    if (valueList[currentPosition] === currentPosition + 0x1) {
      currentPosition++;
    } else {
      resultSequence.unshift(valueList[currentPosition - 0x1]);
      valueList.splice(currentPosition - 0x1, 0x1);
      // outputError(valueList.length + " " + currentPosition); // Debugging line, commented out
      currentPosition = 0x0;
    }
  }

  outputResult(performConversion(resultSequence, 0x9));
}
