var dataStream = initializeInputReader();
processData();

function retrieveInteger() {
  return transformContent(fetchNextItem(), 1);
}

function fetchWordArray() { // Splits by spaces
  return transformContent(fetchNextItem(), 2);
}

function fetchNumberArray() { // Splits by spaces and converts to numbers
  return transformContent(fetchNextItem(), 4);
}

function fetchCharacterArray() { // Splits into single characters
  return transformContent(fetchNextItem(), 6);
}

function fetchNextItem() {
  return dataStream.fetch();
}

function hasMoreItems() {
  return dataStream.hasMore();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputReader() {
  var rawLines = readInputFile();
  var inputReader = {
    "sourceLines": rawLines,
    "currentPosition": 0,
    "totalLines": rawLines.length,
    "hasMore": function() {
      return (this.currentPosition < this.totalLines);
    },
    "fetch": function() {
      if (!this.hasMore()) {
        throw new Error("InputBoundsExceeded: No more lines to read.");
      } else {
        var currentItem = this.sourceLines[this.currentPosition];
        this.currentPosition++;
        return currentItem;
      }
    }
  };
  return inputReader;
}

function displayResult(message) {
  console.log(message);
}

function reportError(errorMessage) {
  console.error(errorMessage);
}

// This function handles various data transformations.
// 'input' is the value to be transformed.
// 'conversionType' determines the type of operation.
//  1: Parse as an integer.
//  2: Split string by space.
//  4: Split string by space and map to numbers.
//  6: Split string into individual characters.
//  7: Split string into characters and map to numbers.
//  8: Join array elements with spaces.
//  9: Join array elements with newlines.
//  0: Join array elements without a separator.
function transformContent(input, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(input, 10);
      case 2:
        return input.split(" ");
      case 4:
        return input.split(" ").map((element) => Number(element));
      case 6:
        return input.split("");
      case 7:
        return input.split("").map((element) => Number(element));
      case 8:
        return input.join(" ");
      case 9:
        return input.join("\n");
      case 0:
        return input.join("");
      default:
        return input;
    }
  } catch (err) {
    return input; // Returns original input on error.
  }
}

function processData() {
  var inputString = fetchNextItem();
  var finalScore = 0;

  for (var k = 0; k < inputString.length; k++) {
    // Logic for even indices, excluding the last character.
    if (k % 2 === 0 && k !== inputString.length - 1) {
      if (inputString[k] === "g") {
        finalScore++;
      }
    } else { // Logic for odd indices or the final character.
      if (inputString[k] === "p") {
        finalScore--;
      }
    }
  }
  displayResult(finalScore);
}