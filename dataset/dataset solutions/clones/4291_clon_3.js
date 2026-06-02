var inputHandler = initializeInputReader();
processMainLogic();

function readNextInteger() { return convertInput(readNextLine(), 1); }
function readNextStringArray() { return convertInput(readNextLine(), 2); }
function readNextIntegerArray() { return convertInput(readNextLine(), 4); }
function readNextCharacterArray() { return convertInput(readNextLine(), 6); }
function readNextLine() { return inputHandler.next(); }
function hasMoreLines() { return inputHandler.hasNext(); }

function readInputFile() { return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); }

function initializeInputReader() {
  var rawInputLines = readInputFile();
  var readerInstance = {
    "lines": rawInputLines,
    "currentIndex": 0,
    "totalLines": rawInputLines.length,
    "hasNext": function() { return (this.currentIndex < this.totalLines); },
    "next": function() {
      if (!this.hasNext()) { return ""; }
      var currentLine = this.lines[this.currentIndex];
      this.currentIndex++;
      return currentLine;
    }
  };
  return readerInstance;
}

function printOutput(value) { console.log(value); }
function printError(value) { console.error(value); }

function convertInput(inputValue, conversionType) {
  try {
    const toNumeric = (val) => Number(val); // Helper for Number conversion
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(toNumeric);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(toNumeric);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function processMainLogic() {
  const X_CHARACTER = 'x'; // Constant for the 'x' character
  var inputString = readNextLine();
  var stringLength = inputString.length;

  // Helper function to remove all occurrences of 'x'
  const filterXCharacters = (str) => str.replace(new RegExp(X_CHARACTER, 'g'), "");
  var nonXCharacters = filterXCharacters(inputString);

  var reversedNonX = "";
  var xCountsList = [];
  var currentXCount = 0;

  for (var idx = 0; idx < stringLength; idx = (idx + 1) | 0) {
    var charAtCurrentIndex = inputString[idx]; // Temporary variable for current character
    if (charAtCurrentIndex !== X_CHARACTER) {
      reversedNonX = charAtCurrentIndex + reversedNonX; // Prepend to build reversed string
      xCountsList.push(currentXCount);
      currentXCount = 0; // Reset count for 'x'
    } else {
      currentXCount++; // Increment 'x' count
    }
  }
  xCountsList.push(currentXCount); // Add the final count of 'x's

  printError(xCountsList);

  if (reversedNonX !== nonXCharacters) {
    printOutput(-1);
    return;
  }

  var totalOperations = 0;
  var listSize = xCountsList.length; // Helper variable for list size

  // Small helper function for calculating absolute difference
  const calculateAbsoluteDifference = (valA, valB) => Math.abs(valA - valB);

  for (var idx = 0; idx < listSize; idx = (idx + 1) | 0) {
    var currentSegmentCount = xCountsList[idx];
    var oppositeIndex = listSize - 1 - idx; // Calculate the index of the symmetric element
    var oppositeSegmentCount = xCountsList[oppositeIndex];

    totalOperations += calculateAbsoluteDifference(currentSegmentCount, oppositeSegmentCount);
  }
  printOutput(totalOperations / 2);
}
