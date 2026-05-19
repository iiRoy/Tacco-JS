var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var inputProcessor = {
  "dataLines" : rawData,
  "currentPosition" : 0,
  "totalLines" : rawData.length,
  "getNextElement" : function() {
    if (!this.hasMoreElements()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var retrievedItem = this.dataLines[this.currentPosition];
    this.currentPosition++;
    return retrievedItem;
  },
  "hasMoreElements" : function() {
    return (this.currentPosition < this.totalLines);
  }
};

SolveMazeProblem();

function fetchNextLine() {
  return inputProcessor.getNextElement();
}

function checkIfMoreLines() {
  return inputProcessor.hasMoreElements();
}

function printOutput(text) {
  console.log(text);
} // Standard output function

function logDebugMessage(msg) {
  console.error(msg);
} // Standard error logging

// Utility for input transformation.
// Handles various parsing and joining operations.
function processInputData(inputVal, conversionMode) {
  try {
    switch (conversionMode) {
      case 1: // Parse to integer
        return parseInt(inputVal);
      case 2: // Split by space
        return inputVal.split(" ");
      case 4: // Split by space and map to numbers
        return inputVal.split(" ").map((val) => Number(val));
      case 6: // Split into individual characters
        return inputVal.split("");
      case 7: // Split into individual characters and map to numbers
        return inputVal.split("").map((val) => Number(val));
      case 8: // Join array elements with space
        return inputVal.join(" ");
      case 9: // Join array elements with newline
        return inputVal.join("\n");
      case 0: // Join array elements without delimiter
        return inputVal.join("");
      default: // Return as is
        return inputVal;
    }
  } catch (err) {
    return inputVal; // On error, return original value
  }
}

function SolveMazeProblem() {
  var firstLineValues = processInputData(fetchNextLine(), 4);
  var gridRows = firstLineValues[0];
  var gridCols = firstLineValues[1];

  var mazeLayout = new Array(gridRows);
  for (var rowIndex = 0; rowIndex < gridRows; rowIndex++) {
    mazeLayout[rowIndex] = processInputData(fetchNextLine(), 6);
  }

  // Attempt to trace a path backwards from the goal to the start.
  // Mark visited cells with 'k'.
  var currentYCoord = gridRows - 1;
  var currentXCoord = gridCols - 1;

  while (currentYCoord >= 0 && currentXCoord >= 0) {
    logDebugMessage(currentXCoord + " " + currentYCoord);
    mazeLayout[currentYCoord][currentXCoord] = "k";

    if (currentXCoord === 0 && currentYCoord === 0) {
      // At the starting point (0,0)
      if (mazeLayout[currentYCoord][currentXCoord + 1] !== "#" && mazeLayout[currentYCoord + 1][currentXCoord] !== "#") {
        break; // Path found
      } else {
        printOutput("Impossible");
        return;
      }
    }

    if (currentXCoord === 0) {
      // On the left edge (excluding (0,0))
      if (mazeLayout[currentYCoord - 1][currentXCoord] === "#" && mazeLayout[currentYCoord][currentXCoord + 1] !== "#" && mazeLayout[currentYCoord + 1][currentXCoord] !== "#") {
        currentYCoord--; // Move up
        continue;
      } else {
        printOutput("Impossible");
        return;
      }
    }

    if (currentYCoord === 0) {
      // On the top edge (excluding (0,0))
      if (mazeLayout[currentYCoord][currentXCoord - 1] === "#" && mazeLayout[currentYCoord + 1][currentXCoord] !== "#" && mazeLayout[currentYCoord][currentXCoord + 1] !== "#") {
        currentXCoord--; // Move left
        continue;
      } else {
        printOutput("Impossible");
        return;
      }
    }

    if (currentYCoord === gridRows - 1 && currentXCoord === gridCols - 1) {
      // At the goal (bottom-right corner)
      if (mazeLayout[currentYCoord - 1][currentXCoord] === "#") {
        currentYCoord--; // Move up
      } else {
        currentXCoord--; // Move left
      }
      continue;
    }

    if (currentYCoord === gridRows - 1 || currentXCoord === gridCols - 1) {
      // On the bottom or right edge (excluding goal)
      if ((mazeLayout[currentYCoord - 1][currentXCoord] === "#" && mazeLayout[currentYCoord][currentXCoord - 1] === ".") ||
          (mazeLayout[currentYCoord][currentXCoord - 1] === "#" && mazeLayout[currentYCoord - 1][currentXCoord] === ".")) {
        if (mazeLayout[currentYCoord - 1][currentXCoord] === "#") {
          currentYCoord--; // Move up
        } else {
          currentXCoord--; // Move left
        }
        continue;
      } else {
        printOutput("Impossible");
        return;
      }
    }

    // General case: not on an edge or corner
    if (mazeLayout[currentYCoord + 1][currentXCoord] === "k") {
      // Came from below
      if ((mazeLayout[currentYCoord - 1][currentXCoord] === "#" && mazeLayout[currentYCoord][currentXCoord - 1] === ".") ||
          (mazeLayout[currentYCoord][currentXCoord - 1] === "#" && mazeLayout[currentYCoord - 1][currentXCoord] === ".") && mazeLayout[currentYCoord][currentXCoord + 1] !== "#") {
        if (mazeLayout[currentYCoord - 1][currentXCoord] === "#") {
          currentYCoord--; // Move up
        } else {
          currentXCoord--; // Move left
        }
      } else {
        printOutput("Impossible");
        return;
      }
    } else {
      // Came from right
      if ((mazeLayout[currentYCoord - 1][currentXCoord] === "#" && mazeLayout[currentYCoord][currentXCoord - 1] === ".") ||
          (mazeLayout[currentYCoord][currentXCoord - 1] === "#" && mazeLayout[currentYCoord - 1][currentXCoord] === ".") && mazeLayout[currentYCoord + 1][currentXCoord] !== "#") {
        if (mazeLayout[currentYCoord - 1][currentXCoord] === "#") {
          currentYCoord--; // Move up
        } else {
          currentXCoord--; // Move left
        }
        continue;
      } else {
        printOutput("Impossible");
        return;
      }
    }
  }
  printOutput("Possible");
}
