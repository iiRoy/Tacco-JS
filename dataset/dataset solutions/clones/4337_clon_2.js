var inputProcessor = initializeProcessor();
StartProgram();
function getNextInteger() {
  return convertInput(retrieveNext(), 1);
}
function getNextStringArray() {
  return convertInput(retrieveNext(), 2);
} // Splits input string by single spaces.
function getNextIntegerArray() {
  return convertInput(retrieveNext(), 4);
} // Splits by spaces, then converts elements to numbers.
function getNextCharacterArray() {
  return convertInput(retrieveNext(), 6);
} // Breaks string into an array of individual characters.
function retrieveNext() {
  return inputProcessor.fetchNext();
}
function hasMoreData() {
  return inputProcessor.hasMoreElements();
}
function readStandardInput() {
  // Reads all data from standard input, trims it, and splits into lines.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}
function initializeProcessor() {
  let rawLines = readStandardInput();
  var dataHandler = {
    "lines": rawLines,
    "cursor": 0,
    "maximum": rawLines.length,
    "hasMoreElements": function() {
      return (this.cursor < this.maximum);
    },
    "fetchNext": function() {
      if (!this.hasMoreElements()) {
        return "";
      } else {
        const currentLine = this.lines[this.cursor];
        this.cursor++;
        return currentLine;
      }
    }
  };
  return dataHandler;
}
function printResult(text) {
  console.log(text);
} // Outputs the final result to the standard output.
function printDebug(message) {
  console.error(message);
} // Sends diagnostic messages to the standard error stream.
// This utility function handles various input transformations.
// 'conversionType' determines the specific operation.
// 1: Convert to integer.
// 2: Split by space into string array.
// 4: Split by space into number array.
// 6: Split into character array.
// 7: Split into character array, then convert to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without a separator.
function convertInput(dataItem, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(dataItem, 10);
      case 2:
        return dataItem.split(" ");
      case 4:
        return dataItem.split(" ").map((val) => Number(val));
      case 6:
        return dataItem.split("");
      case 7:
        return dataItem.split("").map((val) => Number(val));
      case 8:
        return dataItem.join(" ");
      case 9:
        return dataItem.join("\n");
      case 0:
        return dataItem.join("");
      default:
        return dataItem;
    }
  } catch (error) {
    return dataItem;
  }
}
function StartProgram() {
  const dimensions = getNextIntegerArray();
  let heightDim = dimensions[0];
  let widthDim = dimensions[1];
  var charCounts = {};
  for (let rowIdx = 0; rowIdx < heightDim; rowIdx++) {
    var currentRowChars = getNextCharacterArray();
    for (let colIdx = 0; colIdx < widthDim; colIdx++) {
      if (charCounts[currentRowChars[colIdx]] === undefined) {
        charCounts[currentRowChars[colIdx]] = 1;
      } else {
        charCounts[currentRowChars[colIdx]]++;
      }
    }
  }
  let countFour = 0;
  let countTwo = 0;
  let countOne = 0;
  const halfHeight = Math.ceil(heightDim / 2);
  const halfWidth = Math.ceil(widthDim / 2);
  printDebug("Half Height: " + halfHeight);
  printDebug("Half Width: " + halfWidth);
  if (heightDim % 2 === 1 && widthDim % 2 === 1) {
    countFour = (halfHeight - 1) * (halfWidth - 1);
    countTwo = (halfHeight - 1) + (halfWidth - 1);
    countOne = 1;
  } else if (heightDim % 2 === 1 && widthDim % 2 !== 1) {
    countFour = halfWidth * (halfHeight - 1);
    countTwo = halfWidth;
  } else if (heightDim % 2 !== 1 && widthDim % 2 === 1) {
    countFour = halfHeight * (halfWidth - 1);
    countTwo = halfHeight;
  } else {
    countFour = halfHeight * halfWidth;
  }
  const uniqueChars = Object.keys(charCounts);
  // Debugging outputs (commented out in original, kept similar structure)
  /*
  printDebug(charCounts);
  printDebug(countFour);
  printDebug(countTwo);
  */
  let foundSufficient = false;
  while (countFour > 0) {
    foundSufficient = false; // Reset flag for current iteration
    for (let k = 0; k < uniqueChars.length; k++) {
      if (charCounts[uniqueChars[k]] >= 4) {
        charCounts[uniqueChars[k]] -= 4;
        countFour--;
        foundSufficient = true;
        break; // Found a character, move to next 'four' block
      }
    }
    if (!foundSufficient) {
      printResult("No");
      return;
    }
  }
  // Debugging outputs (commented out in original, kept similar structure)
  // printDebug(charCounts);
  while (countTwo > 0) {
    foundSufficient = false; // Reset flag for current iteration
    for (let k = 0; k < uniqueChars.length; k++) {
      if (charCounts[uniqueChars[k]] >= 2) {
        charCounts[uniqueChars[k]] -= 2;
        countTwo--;
        foundSufficient = true;
        break; // Found a character, move to next 'two' block
      }
    }
    if (!foundSufficient) {
      printResult("No");
      return;
    }
  }
  while (countOne > 0) {
    foundSufficient = false; // Reset flag for current iteration
    for (let k = 0; k < uniqueChars.length; k++) {
      if (charCounts[uniqueChars[k]] >= 1) {
        charCounts[uniqueChars[k]] -= 1;
        countOne--;
        foundSufficient = true;
        break; // Found a character, move to next 'one' block
      }
    }
    if (!foundSufficient) {
      printResult("No");
      return;
    }
  }
  printResult("Yes");
}