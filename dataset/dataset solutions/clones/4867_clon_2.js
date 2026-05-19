const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

let dataStream = {
  "items" : rawData,
  "currentPos" : 0,
  "totalItems" : rawData.length,

  "retrieveNext" : function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const nextElement = this.items[this.currentPos];
    this.currentPos++;
    return nextElement;
  },

  "hasMore" : function() {
    return (this.currentPos < this.totalItems);
  }
};

ExecuteProgram();

function fetchNextItem() {
  return dataStream.retrieveNext();
}

function checkMoreItems() {
  return dataStream.hasMore();
}

function printOutput(textToDisplay) {
  console.log(textToDisplay);
}

function logError(errorMessage) {
  console.error(errorMessage);
}

/*
 * Utility function for input transformation.
 * Handles various parsing and formatting operations.
 * If conversionType is unknown or an error occurs, the original inputValue is returned.
 *
 * Conversion Types:
 * 1: Convert to integer.
 * 2: Split by space.
 * 4: Split by space and convert to number array.
 * 6: Split into individual characters.
 * 7: Split into individual characters and convert to number array.
 * 8: Join array elements with space.
 * 9: Join array elements with newline.
 * 0: Join array elements without separator.
 */
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((val) => Number(val));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((val) => Number(val));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (err) {
    return inputValue;
  }
}

function ExecuteProgram() {
  const dimensions = transformInput(fetchNextItem(), 4);
  const gridHeight = dimensions[0];
  const gridWidth = dimensions[1];

  const gridData = new Array(gridHeight);
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    gridData[rowIdx] = transformInput(fetchNextItem(), 6);
  }

  // Attempt to navigate from the goal back to the starting point.
  let currentY = gridHeight - 1;
  let currentX = gridWidth - 1;

  while (!(currentY === 0 && currentX === 0)) {
    logError(currentX + " " + currentY);

    if (currentX === 0) {
      if (gridData[currentY - 1][currentX] === "#") {
        currentY--;
        continue;
      } else {
        printOutput("Impossible");
        return;
      }
    }

    if (currentY === 0) {
      if (gridData[currentY][currentX - 1] === "#") {
        currentX--;
        continue;
      } else {
        printOutput("Impossible");
        return;
      }
    }

    // Check for valid moves: one path is '#' and the other is '.'
    if ((gridData[currentY - 1][currentX] === "#" && gridData[currentY][currentX - 1] === ".") ||
        (gridData[currentY][currentX - 1] === "#" && gridData[currentY - 1][currentX] === ".")) {
      if (gridData[currentY - 1][currentX] === "#") {
        currentY--;
      } else {
        currentX--;
      }
      continue;
    } else {
      printOutput("Impossible");
      return;
    }
  }
  printOutput("Possible");
}
