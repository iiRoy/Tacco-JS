var dataSrc = initializeDataSource();

ExecuteProgram();

function retrieveInteger() {
  return transformInput(fetchNextLine(), 1);
}

function retrieveStringArray() {
  return transformInput(fetchNextLine(), 2); // Separates by a single space character
}

function retrieveIntegerArray() {
  return transformInput(fetchNextLine(), 4); // Splits by space and casts to numbers
}

function retrieveCharacterArray() {
  return transformInput(fetchNextLine(), 6); // Divides into individual characters
}

function fetchNextLine() {
  return dataSrc.fetchNextLine();
}

function hasMoreLines() {
  return dataSrc.hasMoreLines();
}

function readInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeDataSource() {
  var inputLines = readInputData();
  var sourceObject = {
    "lineList": inputLines,
    "currentPosition": 0,
    "totalLines": inputLines.length,
    "hasMoreLines": function() {
      return (this.currentPosition < this.totalLines);
    },
    "fetchNextLine": function() {
      if (!this.hasMoreLines()) {
        return "";
      } else {
        var currentLineContent = this.lineList[this.currentPosition];
        this.currentPosition++;
        return currentLineContent;
      }
    }
  };
  return sourceObject;
}

function displayResult(valueToPrint) {
  console.log(valueToPrint);
}

function reportError(errorMessage) {
  console.error(errorMessage);
}

// This function performs various input transformations.
// The 'conversionType' parameter dictates the operation.
// If an invalid type or an error occurs, the original input is returned unchanged.
//  1: Convert input to an integer.
//  2: Split string by spaces into a string array.
//  4: Split string by spaces and map to an array of numbers.
//  6: Split string into an array of individual characters.
//  7: Split string into individual characters and convert to a number array.
//  8: Join array elements with a space.
//  9: Join array elements with a newline character.
//  0: Join array elements without any separator.
function transformInput(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return Number.parseInt(inputVal, 10);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((item) => Number(item));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((item) => Number(item));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (conversionError) {
    return inputVal;
  }
}

function ExecuteProgram() {
  var initialSettings = retrieveIntegerArray();
  var valX = initialSettings[0];
  var valY = initialSettings[1];
  var valA = initialSettings[2];
  var valB = initialSettings[3];
  var valC = initialSettings[4];

  var collectionA = retrieveIntegerArray();
  var collectionB = retrieveIntegerArray();
  var collectionC = retrieveIntegerArray();

  collectionA.sort(function(element1, element2) {
    return element2 - element1; // Sorts in descending order
  });

  collectionB.sort(function(element1, element2) {
    return element2 - element1; // Also sorts in descending order
  });

  var selectedItems = [];
  for (var loopCounter = 0; loopCounter < valX; loopCounter++) {
    selectedItems.push(collectionA[loopCounter]);
  }

  for (var loopCounter = 0; loopCounter < valY; loopCounter++) {
    selectedItems.push(collectionB[loopCounter]);
  }

  selectedItems = selectedItems.concat(collectionC);

  selectedItems.sort(function(element1, element2) {
    return element2 - element1; // Re-sorts the combined list in descending order
  });

  var finalSum = 0;
  for (var loopCounter = 0; loopCounter < valX + valY; loopCounter++) {
    finalSum += selectedItems[loopCounter];
  }

  displayResult(finalSum);
}