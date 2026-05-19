var inputProcessor = initializeInputHandler();
ExecuteProgram();

function retrieveInteger() {
  return transformValue(fetchNextLine(), 1);
}

function retrieveStringArray() {
  return transformValue(fetchNextLine(), 2);
} // Splits by space

function retrieveIntegerArray() {
  return transformValue(fetchNextLine(), 4);
} // Splits by space and converts to numbers

function retrieveCharacterArray() {
  return transformValue(fetchNextLine(), 6);
} // Splits into individual characters

function fetchNextLine() {
  return inputProcessor.fetchNextLine();
}

function hasMoreLines() {
  return inputProcessor.hasMoreLines();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputHandler() {
  var rawInputData = readInputFile();
  var inputHandlerObject = {
    "lineCollection": rawInputData,
    "currentLineIndex": 0,
    "totalLines": rawInputData.length,
    "hasMoreLines": function() {
      return (this.currentLineIndex < this.totalLines);
    },
    "fetchNextLine": function() {
      if (!this.hasMoreLines()) {
        return "";
      } else {
        var currentLineContent = this.lineCollection[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
      }
    }
  };
  return inputHandlerObject;
}

function displayOutput(content) {
  console.log(content);
} // Standard output

function logError(message) {
  console.error(message);
} // Standard error output

// This function handles various data transformations.
// conversionType:
// 1: Convert to integer
// 2: Split by space
// 4: Split by space and convert to number array
// 6: Split into character array
// 7: Split into character array and convert to number array
// 8: Join array with space
// 9: Join array with newline
// 0: Join array without separator
// Default: Return input as is
function transformValue(inputValue, conversionType) {
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
  } catch (conversionError) {
    return inputValue;
  }
}

function ExecuteProgram() {
  var itemCount = retrieveInteger();
  var firstList = retrieveIntegerArray();
  var secondList = retrieveIntegerArray();

  var positiveDifferences = [];
  var deficitSum = 0;
  var totalDifference = 0;
  var resultCount = 0;

  for (var idx = 0; idx < itemCount; idx++) {
    totalDifference += firstList[idx] - secondList[idx];

    if (firstList[idx] - secondList[idx] >= 0) {
      positiveDifferences.push(firstList[idx] - secondList[idx]);
    } else {
      deficitSum += secondList[idx] - firstList[idx];
      resultCount++;
    }
  }

  if (totalDifference < 0) {
    displayOutput(-1);
  } else {
    positiveDifferences.sort(function(valA, valB) {
      return valB - valA; // Sort in descending order
    });

    for (var idx = 0; idx < positiveDifferences.length; idx++) {
      if (deficitSum <= 0) {
        break; // No more deficit to cover
      }
      deficitSum -= positiveDifferences[idx];
      resultCount++;
    }

    displayOutput(resultCount);
  }
}
