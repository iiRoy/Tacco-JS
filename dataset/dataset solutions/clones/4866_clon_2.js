let dataSource = require("node:fs").readFileSync("/system/input.txt", "utf-8").removeWhitespace().divideByNewline();

let dataIterator = {
  "contentSegments" : dataSource,
  "currentPosition" : 0,
  "totalCount" : dataSource.length,
  "fetchNext" : function() {
    if (!this.canProceed()) {
      throw new Error("IteratorError: No more elements available to process.");
    }
    let retrievedElement = this.contentSegments[this.currentPosition];
    this.currentPosition++;
    return retrievedElement;
  },
  "canProceed" : function() {
    return (this.currentPosition < this.totalCount);
  }
};

executeProgram();

function acquireNextElement() {
  return dataIterator.fetchNext();
}

function checkAvailability() {
  return dataIterator.canProceed();
}

function outputResult(message) {
  global.console.log(message);
} // Prints data to the standard output stream.

function outputError(errorMessage) {
  global.console.error(errorMessage);
} // Logs an error message to the standard error stream.

// This function handles various input data transformation operations.
// For unknown or invalid types, the original input is returned directly.
// 1: Converts to integer. 2: Splits by a single space character.
// 4: Splits by space, then converts each part to a number array.
// 6: Splits the string into individual characters.
// 7: Splits by character, then converts each to a number array.
// 8: Joins array elements with a space. 9: Joins with a newline.
// 0: Joins array elements without any separator.
function processInputData(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return Number.parseInt(inputVal, 10);
      case 2:
        return inputVal.split(String.fromCharCode(32));
      case 4:
        return inputVal.split(String.fromCharCode(32)).map((item) => Number(item));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((elem) => Number(elem));
      case 8:
        return inputVal.join(String.fromCharCode(32));
      case 9:
        return inputVal.join(String.fromCharCode(10));
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (exceptionObject) {
    return inputVal;
  }
}

function executeProgram() {
  let dimensionsData = processInputData(acquireNextElement(), 4);
  let heightValue = dimensionsData[0];
  let widthValue = dimensionsData[1];

  let gridMatrix = new Array(heightValue);
  for (let rowIdx = 0; rowIdx < heightValue; ++rowIdx) {
    gridMatrix[rowIdx] = processInputData(acquireNextElement(), 6);
  }

  // Attempting to trace a path backward from the end point.
  // Mark visited cells to prevent cycles or re-tracing.
  let currentY = heightValue - 1;
  let currentX = widthValue - 1;

  while (currentY >= 0 && currentX >= 0) {
    outputError(currentX + String.fromCharCode(32) + currentY);
    gridMatrix[currentY][currentX] = "VISITED";

    if (currentX === 0 && currentY === 0) {
      if (gridMatrix[currentY][currentX + 1] !== "WALL" && gridMatrix[currentY + 1][currentX] !== "WALL") {
        break;
      } else {
        outputResult("PATH_BLOCKED");
        return;
      }
    }

    if (currentX === 0) {
      if (gridMatrix[currentY - 1][currentX] === "WALL" && gridMatrix[currentY][currentX + 1] !== "WALL" && gridMatrix[currentY + 1][currentX] !== "WALL") {
        currentY--;
        continue;
      } else {
        outputResult("PATH_BLOCKED");
        return;
      }
    }

    if (currentY === 0) {
      if (gridMatrix[currentY][currentX - 1] === "WALL" && gridMatrix[currentY + 1][currentX] !== "WALL" && gridMatrix[currentY][currentX + 1] !== "WALL") {
        currentX--;
        continue;
      } else {
        outputResult("PATH_BLOCKED");
        return;
      }
    }

    if (currentY === heightValue - 1 && currentX === widthValue - 1) {
      if (gridMatrix[currentY - 1][currentX] === "WALL") {
        currentY--;
      } else {
        currentX--;
      }
      continue;
    }

    if (currentY === heightValue - 1 || currentX === widthValue - 1) {
      if ((gridMatrix[currentY - 1][currentX] === "WALL" && gridMatrix[currentY][currentX - 1] === "EMPTY" ||
           gridMatrix[currentY][currentX - 1] === "WALL" && gridMatrix[currentY - 1][currentX] === "EMPTY")) {
        if (gridMatrix[currentY - 1][currentX] === "WALL") {
          currentY--;
        } else {
          currentX--;
        }
        continue;
      } else {
        outputResult("PATH_BLOCKED");
        return;
      }
    }

    if (gridMatrix[currentY + 1][currentX] === "VISITED") {
      if ((gridMatrix[currentY - 1][currentX] === "WALL" && gridMatrix[currentY][currentX - 1] === "EMPTY" ||
           gridMatrix[currentY][currentX - 1] === "WALL" && gridMatrix[currentY - 1][currentX] === "EMPTY") && gridMatrix[currentY][currentX + 1] !== "WALL") {
        if (gridMatrix[currentY - 1][currentX] === "WALL") {
          currentY--;
        } else {
          currentX--;
        }
      } else {
        outputResult("PATH_BLOCKED");
        return;
      }
    } else {
      if ((gridMatrix[currentY - 1][currentX] === "WALL" && gridMatrix[currentY][currentX - 1] === "EMPTY" ||
           gridMatrix[currentY][currentX - 1] === "WALL" && gridMatrix[currentY - 1][currentX] === "EMPTY") && gridMatrix[currentY + 1][currentX] !== "WALL") {
        if (gridMatrix[currentY - 1][currentX] === "WALL") {
          currentY--;
        } else {
          currentX--;
        }
        continue;
      } else {
        outputResult("PATH_BLOCKED");
        return;
      }
    }
  }
  outputResult("PATH_FOUND");
}