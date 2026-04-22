var dataStream = require("node:fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n");

var dataFeeder =
  {
    "contentLines": dataStream,
    "currentPosition": 0,
    "totalElements": dataStream.length,

    "hasMoreEntries": function() {
      return (this.currentPosition < this.totalElements);
    },

    "fetchNextEntry": function() {
      if (!this.hasMoreEntries()) {
        return "";
      }
      var retrievedItem = this.contentLines[this.currentPosition];
      this.currentPosition++;
      return retrievedItem;
    }
  };

RunCoreLogic();

function getDatum() {
  return dataFeeder.fetchNextEntry();
}

function getInteger() {
  return transformValue(getDatum(), 1);
}

function getStringArray() {
  return transformValue(getDatum(), 2);
}

function getNumericArray() {
  return transformValue(getDatum(), 4);
}

function getCharacterArray() {
  return transformValue(getDatum(), 6);
}

function moreAvailable() {
  return dataFeeder.hasMoreEntries();
}

function printResult(outputVal) {
  console.log(outputVal);
}

function logError(errorMsg) {
  console.error(errorMsg);
}

/*
 * This utility function handles various data transformations.
 * It takes an input value and an operation code to determine the conversion.
 *
 * Operation Codes:
 *   1: Converts the input string to an integer.
 *   2: Splits the input string by spaces into an array of strings.
 *   4: Splits the input string by spaces and converts each part to a floating-point number.
 *   6: Splits the input string into an array of individual characters.
 *   7: Splits the input string into individual characters and converts each to a floating-point number.
 *   8: Joins array elements into a string, separated by spaces.
 *   9: Joins array elements into a string, separated by newlines.
 *   0: Joins array elements into a string without any separator.
 *
 * If the operationCode is not recognized or an error occurs, the original input value is returned.
 */
function transformValue(inputVal, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return Number.parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((item) => parseFloat(item));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((item) => parseFloat(item));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (exceptionObject) {
    return inputVal;
  }
}

function RunCoreLogic() {
  var depthLevel = getInteger();
  var currentSet = new Array(Math.pow(2, depthLevel));

  for (var outerLoopIdx = 0; outerLoopIdx < currentSet.length; outerLoopIdx++) {
    currentSet[outerLoopIdx] = getInteger();
  }

  var nextSet;
  for (var outerLoopIdx = 0; outerLoopIdx < depthLevel; outerLoopIdx++) {
    nextSet = new Array(Math.pow(2, depthLevel - outerLoopIdx - 1));
    for (var innerLoopIdx = 0; innerLoopIdx < currentSet.length; innerLoopIdx = innerLoopIdx + 2) {
      if (currentSet[innerLoopIdx] > currentSet[innerLoopIdx + 1]) {
        nextSet[innerLoopIdx / 2] = currentSet[innerLoopIdx] - currentSet[innerLoopIdx + 1];
      } else if (currentSet[innerLoopIdx] < currentSet[innerLoopIdx + 1]) {
        nextSet[innerLoopIdx / 2] = currentSet[innerLoopIdx + 1] - currentSet[innerLoopIdx];
      } else {
        nextSet[innerLoopIdx / 2] = currentSet[innerLoopIdx];
      }
    }
    currentSet = nextSet;
    // logError(currentSet); // Debugging output, intentionally commented out.
  }
  printResult(currentSet[0]);
}