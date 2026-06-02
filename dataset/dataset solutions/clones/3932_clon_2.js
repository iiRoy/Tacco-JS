var sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  contentArray: sourceLines,
  currentPosition: 0,
  totalElements: sourceLines.length,

  retrieveNext: function() {
    if (!this.checkAvailability()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var extractedItem = this.contentArray[this.currentPosition];
    this.currentPosition++;
    return extractedItem;
  },

  checkAvailability: function() {
    return (this.currentPosition < this.totalElements);
  }
};

// Initiate the main processing routine
executePrimaryLogic();

// Global utility to get the next line from the input stream
function fetchNextInput() {
  return dataStream.retrieveNext();
}

// Global utility to check if more input lines are available
function hasMoreInput() {
  return dataStream.checkAvailability();
}

// Function for standard console output
function displayOutput(outputContent) {
  console.log(outputContent);
}

// Function for standard error output
function reportError(errorContent) {
  console.error(errorContent);
}

/*
 * This function handles various input transformations.
 *
 * Parameters:
 *   inputValue: The input value to be transformed.
 *   conversionType: An integer indicating the desired transformation.
 *
 * Conversion Types:
 *   1: Convert to integer.
 *   2: Split by space.
 *   4: Split by space and convert elements to numbers.
 *   6: Split into individual characters.
 *   7: Split into individual characters and convert to numbers.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any separator.
 *   Default: Return inputValue as is.
 *
 * Error Handling:
 *   If an error occurs during conversion, the original inputValue is returned.
 */
function transformInput(inputValue, conversionType) {
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
  } catch (errorDetails) {
    return inputValue;
  }
}

function executePrimaryLogic() {
  var currentString = fetchNextInput();

  // Logic for strings shorter than 26 characters:
  // Append the lexicographically smallest unused character.
  // Logic for strings exactly 26 characters:
  // Check if it's "zyxwvutsrqponmlkjihgfedcba". If so, output -1.
  // Otherwise, find the first position from the right where a character
  // can be replaced by a lexicographically larger one, and truncate the rest.

  var alphabetChars = transformInput("abcdefghijklmnopqrstuvwxyz", 6);

  if (currentString.length < 26) {
    // Mark characters used in currentString as empty in alphabetChars
    for (var idx = 0; idx < currentString.length; idx++) {
      alphabetChars[alphabetChars.indexOf(currentString[idx])] = "";
    }

    // For debugging: show remaining alphabet characters
    reportError(alphabetChars);

    // Find the first non-empty (unused) character and append it
    for (var idx = 0; idx < 26; idx++) {
      if (alphabetChars[idx] !== "") {
        currentString += alphabetChars[idx];
        break;
      }
    }
    displayOutput(currentString);
  } else {
    // String length is 26
    if (currentString === "zyxwvutsrqponmlkjihgfedcba") {
      displayOutput(-1);
    } else {
      // This block is intentionally left empty as per original logic.
      // The problem statement implies a more complex lexicographical
      // next string logic for 26-char strings not equal to the max,
      // but the original code does not implement it.
    }
  }
}
