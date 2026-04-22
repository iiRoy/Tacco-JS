var resultValue;
var rawData = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n");

var inputProcessor = {
  "sourceData": rawData,
  "currentPosition": 0,
  "totalElements": rawData.length,
  "getNextItem": function() {
    if (!this.hasMoreItems()) {
      throw "NoMoreElements: No further items available.";
    }
    var retrievedItem = this.sourceData[this.currentPosition];
    this.currentPosition++;
    return retrievedItem;
  },
  "hasMoreItems": function() {
    return (this.currentPosition < this.totalElements);
  }
};

ProcessInput();

function fetchNextElement() {
  return inputProcessor.getNextItem();
}

function checkMoreElements() {
  return inputProcessor.hasMoreItems();
}

function displayResult(content) {
  console.log(content);
} // Prints the given content to standard output

function reportError(errorMessage) {
  console.error(errorMessage);
} // Outputs an error message to standard error stream

// Handling of input elements based on transformation type. Numeric types.
// If unknown type or error, returns input value as is.
// 1: Convert to integer. 2: Split by space. 4: Split by space, convert to number array.
// 6: Split into characters. 7: Split into characters, convert to number array.
// 8: Join with spaces. 9: Join with newlines. 0: Join without separator.
function dataTransformer(inputValue, transformationType) {
  try {
    switch (transformationType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((item) => Number(item));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((item) => Number(item));
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

function ProcessInput() {
  var characterSequence = dataTransformer(fetchNextElement(), 6);
  var frequencyMap = {};

  for (var idx = 0; idx < characterSequence.length; idx++) {
    if (frequencyMap[characterSequence[idx]] == null) {
      frequencyMap[characterSequence[idx]] = 1;
    } else {
      frequencyMap[characterSequence[idx]]++;
    }
  }

  var dominantCharacters = [];
  var operationLimit = 0;
  var uniqueChars = Array.from(Object.keys(frequencyMap));

  if (uniqueChars.length === 1) {
    displayResult(0);
    return;
  }

  var minimumRequiredOperations = 113; // Arbitrary large initial value
  for (var charIndex = 0; charIndex < uniqueChars.length; charIndex++) {
    var targetChar = uniqueChars[charIndex];
    var tempSequence = Object.assign([], characterSequence);
    var operationCounter = 0;

    while (!verifyAllSame(tempSequence, targetChar)) {
      for (var k = 0; k < tempSequence.length; k++) {
        if (tempSequence[k + 1] === targetChar) {
          tempSequence[k] = targetChar;
        }
      }
      tempSequence.pop();
      operationCounter++;
    }
    minimumRequiredOperations = Math.min(minimumRequiredOperations, operationCounter);
  }
  displayResult(minimumRequiredOperations);
}

function verifyAllSame(inputString, targetCharacter) {
  var isUniform = true;
  for (var charPos = 0; charPos < inputString.length; charPos++) {
    if (inputString[charPos] !== targetCharacter) {
      isUniform = false;
      break;
    }
  }
  return isUniform;
}