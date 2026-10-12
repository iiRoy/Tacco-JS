var dataProcessor = initializeInputHandler();
ExecuteProgram();
function retrieveInteger() {
  return performConversion(retrieveNextLine(), 1);
}
function retrieveStringArray() {
  return performConversion(retrieveNextLine(), 2);
} // Splits by space
function retrieveIntegerArray() {
  return performConversion(retrieveNextLine(), 4);
} // Splits by space and converts to numbers
function retrieveCharacterArray() {
  return performConversion(retrieveNextLine(), 6);
} // Splits into individual characters
function retrieveNextLine() {
  return dataProcessor.retrieveNextLine();
}
function hasMoreLines() {
  return dataProcessor.hasMoreLines();
}
function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}
function initializeInputHandler() {
  var inputLines = readInputFile();
  var handlerObject = {
    lineCollection: inputLines,
    currentPosition: 0,
    totalLines: inputLines.length,
    hasMoreLines: function () {
      return this.currentPosition < this.totalLines;
    },
    retrieveNextLine: function () {
      if (!this.hasMoreLines()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentLine = this.lineCollection[this.currentPosition];
        this.currentPosition++;
        return currentLine;
      }
    },
  };
  return handlerObject;
}
function printOutput(outputValue) {
  console.log(outputValue);
} // Standard output
function printError(errorMessage) {
  console.error(errorMessage);
} // Standard error output
// Conversion types:
// 1: Convert to integer
// 2: Split by space
// 4: Split by space and map to numbers
// 6: Split into characters
// 7: Split into characters and map to numbers
// 8: Join with space
// 9: Join with newline
// 0: Join without separator
// Default: Return input as is
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
  } catch (conversionError) {
    return inputValue;
  }
}
function ExecuteProgram() {
  var inputNumber = retrieveInteger();
  var resultCount = 0;
  /*
  for (var loopCounter = 2; loopCounter <= inputNumber; loopCounter++) {
    var tempValue = inputNumber;
    while (tempValue >= loopCounter) {
      if (tempValue % loopCounter == 0) {
        tempValue /= loopCounter;
      } else {
        tempValue -= loopCounter;
      }
    }
    if (tempValue == 1) {
      printError(loopCounter);
      resultCount++;
    }
  }
  */
  printOutput(calculateDivisors(inputNumber - 1).length + 1);
}
function calculateDivisors(targetValue) {
  var divisorCollection = [];
  for (var iterator = 1; iterator * iterator <= targetValue; iterator++) {
    if (targetValue % iterator == 0) {
      divisorCollection.push(iterator);
      if (iterator * iterator != targetValue) {
        divisorCollection.push(targetValue / iterator);
      }
    }
  }
  divisorCollection.sort(function (valA, valB) {
    return valA - valB;
  });
  return divisorCollection;
}
