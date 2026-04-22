const initialLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const dataManager = {
  "storedContent": initialLines,
  "currentIndex": 0,
  "totalCount": initialLines.length,

  "getNextItem": function() {
    if (!this.checkMoreItems()) {
      throw "SequenceTraversalError: No further elements are present.";
    }
    let retrievedPiece = this.storedContent[this.currentIndex];
    this.currentIndex++;
    return retrievedPiece;
  },

  "checkMoreItems": function() {
    return (this.currentIndex < this.totalCount);
  }
};

// Begin the main application logic.
ExecutePrimaryLogic();

function fetchNextElement() {
  return dataManager.getNextItem();
}

function checkAvailability() {
  return dataManager.checkMoreItems();
}

// Function to print standard informational messages.
function showOutput(content) {
  console.info(content);
}

// Function to print warning messages.
function issueWarning(message) {
  console.warn(message);
}

// This utility function handles various data transformations based on a mode.
// Input parameter 'inputVal' is the data to be processed.
// 'processingMode' determines the type of transformation:
//  - 1: Converts to an integer.
//  - 2: Splits a string by spaces.
//  - 4: Splits by spaces and maps each part to a Number.
//  - 6: Splits a string into individual characters.
//  - 7: Splits into characters and maps each to a Number.
//  - 8: Joins array elements with spaces.
//  - 9: Joins array elements with newlines.
//  - 0: Joins array elements without any separator.
//  - Default: Returns the input value unchanged.
function processInputVariant(inputVal, processingMode) {
  try {
    switch (processingMode) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((item) => Number(item));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((character) => Number(character));
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
    // In case of any error during conversion, return the original input.
    return inputVal;
  }
}

function ExecutePrimaryLogic() {
  let currentSequence = fetchNextElement(); // Obtain the initial string from input.

  // The primary logic involves string manipulation based on its length.
  // If the string is less than 26 characters, it appends the lexicographically
  // smallest unused character from the English alphabet.
  // If it's exactly 26 characters, it checks for a specific reverse-alphabetical
  // pattern or implies a different transformation (not fully detailed in original).

  const fullAlphabet = processInputVariant("abcdefghijklmnopqrstuvwxyz", 6);

  if (currentSequence.length < 26) {
    // Iterate through the input sequence to mark characters as "used" in the alphabet list.
    for (let charIterator = 0; charIterator < currentSequence.length; charIterator++) {
      fullAlphabet[fullAlphabet.indexOf(currentSequence[charIterator])] = "";
    }
    issueWarning(fullAlphabet); // Output the modified alphabet array for debugging.

    // Find and append the first available (non-empty) character from the alphabet.
    for (let charPosition = 0; charPosition < 26; charPosition++) {
      if (fullAlphabet[charPosition] !== "") {
        currentSequence += fullAlphabet[charPosition];
        break;
      }
    }
    showOutput(currentSequence); // Display the resulting string.
  } else {
    // Handle cases where the sequence length is 26 characters.
    if (currentSequence === "zyxwvutsrqponmlkjihgfedcba") {
      showOutput(-1); // Specific output for the full reverse alphabet string.
    } else {
      // This branch is left empty, matching the original code's structure.
      // Additional logic for other 26-character strings would go here.
    }
  }
}