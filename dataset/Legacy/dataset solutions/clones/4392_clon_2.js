var sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  "contentLines" : sourceData,
  "currentPosition" : 0,
  "totalLines" : sourceData.length,

  "retrieveNext" : function() {
    // Check if there are more elements available in the stream.
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var itemFetched = this.contentLines[this.currentPosition];
    this.currentPosition++;
    return itemFetched;
  },

  "hasMore" : function() {
    // Determine if the current position is within the bounds of total lines.
    return (this.currentPosition < this.totalLines);
  }
};

// Initiate the primary execution flow.
executePrimaryLogic();

// Helper functions for data retrieval and conversion.
function fetchNextLine() {
  return dataStream.retrieveNext();
}

function fetchNextInteger() {
  return dataConverter(fetchNextLine(), 1);
}

function fetchNextStringArray() {
  return dataConverter(fetchNextLine(), 2); // Split by half-width space
}

function fetchNextIntegerArray() {
  return dataConverter(fetchNextLine(), 4); // Split by half-width space and convert to numbers
}

function fetchNextCharacterArray() {
  return dataConverter(fetchNextLine(), 6); // Split into individual characters
}

function checkMoreData() {
  return dataStream.hasMore();
}

// Functions for output.
function displayOutput(val) {
  console.log(val); // Standard output
}

function displayError(msg) {
  console.error(msg); // Standard error output
}

// Data conversion utility.
// Conversion types:
// Default: Returns input as is.
// 1: Converts to integer.
// 2: Splits string by space.
// 4: Splits by space and maps to numbers.
// 6: Splits string into individual characters.
// 7: Splits by character and maps to numbers.
// 8: Joins array elements with a space.
// 9: Joins array elements with a newline.
// 0: Joins array elements without a separator.
function dataConverter(inputValue, conversionKind) {
  try {
    switch (conversionKind) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((charItem) => Number(charItem));
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
    return inputValue; // Return original value on error
  }
}

// Main logic for the problem.
function executePrimaryLogic() {
  var firstLineValues = fetchNextIntegerArray();
  var quarterLiterCost = firstLineValues[0];
  var halfLiterCost = firstLineValues[1];
  var singleLiterCost = firstLineValues[2];
  var doubleLiterCost = firstLineValues[3];
  var litersNeeded = fetchNextInteger();

  // Calculate equivalent costs for 2 liters based on smaller units.
  var costQ_8x = quarterLiterCost * 8; // 8 * 0.25L = 2L
  var costH_4x = halfLiterCost * 4;   // 4 * 0.5L = 2L
  var costS_2x = singleLiterCost * 2; // 2 * 1L = 2L

  var totalMinimumCost = 0;

  // Options for purchasing 2 liters.
  var twoLiterOptions = [costQ_8x, costH_4x, costS_2x, doubleLiterCost];
  var minCostForTwoLiters = Math.min.apply(null, twoLiterOptions);

  // Calculate cost for even number of liters.
  totalMinimumCost = minCostForTwoLiters * Math.floor(litersNeeded / 2);

  // If an odd number of liters is needed, calculate the cost for the remaining 1 liter.
  if (litersNeeded % 2 === 1) {
    // Equivalent costs for 1 liter based on smaller units.
    var costQ_4x = quarterLiterCost * 4; // 4 * 0.25L = 1L
    var costH_2x = halfLiterCost * 2;   // 2 * 0.5L = 1L
    totalMinimumCost += Math.min(costQ_4x, Math.min(costH_2x, singleLiterCost));
  }

  displayOutput(totalMinimumCost);
}
