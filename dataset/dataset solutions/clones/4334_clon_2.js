var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  sourceData: rawData,
  currentPosition: 0,
  totalElements: rawData.length,

  retrieveNext: function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var elementToReturn = this.sourceData[this.currentPosition];
    this.currentPosition++;
    return elementToReturn;
  },

  hasMore: function() {
    return (this.currentPosition < this.totalElements);
  }
};

executePrimaryLogic();

function fetchNextItem() {
  return dataStream.retrieveNext();
}

function checkAvailability() {
  return dataStream.hasMore();
}

function displayOutput(messageContent) {
  console.log(messageContent);
}

function reportError(messageContent) {
  console.error(messageContent);
}

// This function handles various input transformations.
// conversionType:
//   1: Parse as integer.
//   2: Split by space.
//   4: Split by space and map to numbers.
//   6: Split by character.
//   7: Split by character and map to numbers.
//   8: Join array with space.
//   9: Join array with newline.
//   0: Join array without separator.
//   Default: Return input as is.
function transformInput(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputVal);
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
  } catch (errorDetails) {
    return inputVal;
  }
}

function executePrimaryLogic() {
  var parsedNumbers = transformInput(fetchNextItem(), 4);
  var firstDimension = parsedNumbers[0];
  var secondDimension = parsedNumbers[1];
  var targetValue = parsedNumbers[2];

  if (targetValue % secondDimension === 0 || targetValue % firstDimension === 0) {
    displayOutput("Yes");
    return;
  }

  for (var rowIterator = 1; rowIterator <= firstDimension; rowIterator++) {
    for (var colIterator = 1; colIterator <= secondDimension; colIterator++) {
      var calculatedSum = (secondDimension * rowIterator) + (firstDimension * colIterator) - 2 * (rowIterator * colIterator);
      if (calculatedSum === targetValue) {
        displayOutput("Yes");
        return;
      }
    }
  }
  displayOutput("No");
}
