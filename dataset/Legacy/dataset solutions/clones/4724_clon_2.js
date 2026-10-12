var inputHandler = initializeInputProcessor();

ProcessData();

function retrieveInteger() {
  return convertInput(fetchNextLine(), 1);
}

function retrieveStringArray() {
  return convertInput(fetchNextLine(), 2);
}

function retrieveIntegerArray() {
  return convertInput(fetchNextLine(), 4);
}

function retrieveCharacterArray() {
  return convertInput(fetchNextLine(), 6);
}

function fetchNextLine() {
  return inputHandler.getNextLine();
}

function hasMoreLines() {
  return inputHandler.hasMoreLines();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputProcessor() {
  var rawInputLines = readInputFile();
  var processorInstance = {
    lineBuffer: rawInputLines,
    currentLineIndex: 0,
    totalLines: rawInputLines.length,
    hasMoreLines: function() {
      return (this.currentLineIndex < this.totalLines);
    },
    getNextLine: function() {
      if (!this.hasMoreLines()) {
        throw "ArrayIndexOutOfBoundsException No more input available.";
      } else {
        var currentLineContent = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
      }
    }
  };
  return processorInstance;
}

function displayResult(content) {
  console.log(content);
}

function logError(message) {
  console.error(message);
}

// This function handles various input conversions.
// 'inputValue' is the data to convert.
// 'conversionType' specifies the conversion method:
// 1: Convert to integer.
// 2: Split by space into a string array.
// 4: Split by space and convert to an array of numbers.
// 6: Split into a character array.
// 7: Split into a character array and convert to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without a separator.
// Default: Return input as is.
function convertInput(inputValue, conversionType) {
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
  } catch (error) {
    return inputValue;
  }
}

function ProcessData() {
  var firstLineData = retrieveIntegerArray();
  var numItems = firstLineData[0];
  var targetA = firstLineData[1];
  var targetB = firstLineData[2];

  var itemDetails = new Array(numItems);
  for (var itemIdx = 0; itemIdx < numItems; itemIdx++) {
    itemDetails[itemIdx] = retrieveIntegerArray();
  }

  var minCostDP = new Array(numItems + 1);
  var maxPossibleSum = 151; // Max sum for A or B, based on problem constraints

  // Initialize DP table with nulls
  for (var itemIdx = 0; itemIdx < numItems + 1; itemIdx++) {
    minCostDP[itemIdx] = new Array(maxPossibleSum);
    for (var currentSumA = 0; currentSumA < maxPossibleSum; currentSumA++) {
      minCostDP[itemIdx][currentSumA] = new Array(maxPossibleSum);
    }
  }

  // Base case: 0 items, 0 A, 0 B, cost is 0
  minCostDP[0][0][0] = 0;

  // dp[itemIdx][currentSumA][currentSumB] : minimum cost to achieve
  // currentSumA and currentSumB using 'itemIdx' number of items.
  for (var itemIdx = 1; itemIdx <= numItems; itemIdx++) {
    // First, copy values from the previous itemIdx (not using the current item)
    for (var currentSumA = 0; currentSumA < maxPossibleSum; currentSumA++) {
      for (var currentSumB = 0; currentSumB < maxPossibleSum; currentSumB++) {
        if (minCostDP[itemIdx - 1][currentSumA][currentSumB] != null) {
          minCostDP[itemIdx][currentSumA][currentSumB] = minCostDP[itemIdx - 1][currentSumA][currentSumB];
        }
      }
    }

    var currentItem = itemDetails[itemIdx - 1]; // Get the current item's properties
    var itemA = currentItem[0];
    var itemB = currentItem[1];
    var itemCost = currentItem[2];

    // Now, consider using the current item
    for (var prevSumA = 0; prevSumA < maxPossibleSum; prevSumA++) {
      for (var prevSumB = 0; prevSumB < maxPossibleSum; prevSumB++) {
        if (minCostDP[itemIdx - 1][prevSumA][prevSumB] != null) {
          var newSumA = prevSumA + itemA;
          var newSumB = prevSumB + itemB;

          if (newSumA < maxPossibleSum && newSumB < maxPossibleSum) {
            var potentialCost = minCostDP[itemIdx - 1][prevSumA][prevSumB] + itemCost;

            if (minCostDP[itemIdx][newSumA][newSumB] == null) {
              minCostDP[itemIdx][newSumA][newSumB] = potentialCost;
            } else {
              minCostDP[itemIdx][newSumA][newSumB] = Math.min(potentialCost, minCostDP[itemIdx][newSumA][newSumB]);
            }
          }
        }
      }
    }
  }

  var multiplier = 1;
  var minimumTotalCost = 1000000000; // A sufficiently large initial value

  while (true) {
    var currentTargetA = targetA * multiplier;
    var currentTargetB = targetB * multiplier;

    if (currentTargetA < maxPossibleSum && currentTargetB < maxPossibleSum) {
      if (minCostDP[numItems][currentTargetA][currentTargetB] != null) {
        minimumTotalCost = Math.min(minimumTotalCost, minCostDP[numItems][currentTargetA][currentTargetB]);
      }
    } else {
      break; // Target sums exceed the DP table bounds
    }
    multiplier++;
  }

  if (minimumTotalCost === 1000000000) {
    displayResult(-1); // No combination found
  } else {
    displayResult(minimumTotalCost);
  }
}
