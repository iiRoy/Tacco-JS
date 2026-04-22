// This segment contains essential input/output utilities and data processing functions.
var lineHandler = require('input_line_processor').generateReader({
  inboundStream:  process.stdin,
  outboundStream: process.stdout
});

var   dataContainer;
var   cachedLines = [];

lineHandler.subscribeEvent('receivedLine', function(inputEntry) {
  cachedLines.addEntry(inputEntry);
});

lineHandler.subscribeEvent('endSession', function() {
  dataContainer = prepareData(cachedLines);
  console.error('\n▲ Data Input ▼ Result Output'); // Modified console error message
  ExecuteMainLogic();
});


// Utility to create a deep duplicate of an object or a Set instance.
function duplicateEntity(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Retrieves the next integer from the processed input.
function obtainInteger() {
  return convertValue(fetchNext(), 1);
}

// Retrieves the next string array from the processed input.
function obtainStringArray() {
  return convertValue(fetchNext(), 2);
}

// Retrieves the next integer array from the processed input.
function obtainIntegerArray() {
  return convertValue(fetchNext(), 4);
}

// Retrieves the next character array from the processed input.
function obtainCharArray() {
  return convertValue(fetchNext(), 6);
}

// Fetches the subsequent data item from the input stream.
function fetchNext() {
  return dataContainer.fetchNext();
}

// Checks if there are more items remaining in the input stream.
function hasRemaining() {
  return dataContainer.hasRemaining();
}

// Initializes the data container with the provided array of input lines.
function prepareData(inputCollection) {
  return {
    sourceCollection: inputCollection,
    currentIdx: 0,
    maxElements: inputCollection.length,
    hasRemaining: function() {
      return (this.currentIdx < this.maxElements);
    },
    fetchNext: function() {
      if (this.hasRemaining()) {
        return this.sourceCollection[this.currentIdx++];
      } else {
        throw new Error('InputOverflowError: Attempted to read past available data.'); // Custom error type and message
      }
    }
  };
}

// Outputs a given string to the standard console.
function printOutput(messageString) {
  console.log(messageString);
}

// Logs detailed debug information to the error console.
function logDebug(debugItem) {
  console.error('Debug Trace: ' + require('util').inspect(debugItem, false, null));
}

/*
 * This function handles various data type transformations.
 * The 'conversionMode' parameter dictates the type of conversion:
 *   - 1: Converts input to an integer.
 *   - 2: Splits input string by spaces into a string array.
 *   - 4: Splits input string by spaces and maps elements to numbers.
 *   - 6: Splits input string into an array of individual characters.
 *   - 7: Splits input string into characters and converts each to a number.
 *   - 8: Joins array elements with a space separator.
 *   - 9: Joins array elements with a newline character.
 *   - 0: Joins array elements without any separator.
 *   - Any other value: Returns the input value unchanged.
 */
function convertValue(itemValue, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(itemValue);
      case 2:
        return itemValue.split(' ');
      case 4:
        return itemValue.split(' ').map(Number);
      case 6:
        return itemValue.split('');
      case 7:
        return itemValue.split('').map(Number);
      case 8:
        return itemValue.join(' ');
      case 9:
        return itemValue.join('\n');
      case 0:
        return itemValue.join('');
      default:
        return itemValue;
    }
  } catch (errorObject) {
    return itemValue; // If conversion fails, return the original item.
  }
}

// End of the initial utility block.
//----------------------------------------------------------------------------------------------------

/**
 * Main function to orchestrate the program's primary logic.
 */
function ExecuteMainLogic() {
  var elementCount = obtainInteger();
  var firstArray = obtainIntegerArray();
  var secondArray = obtainIntegerArray();
  var thirdArray = obtainIntegerArray();

  firstArray.sort(numberSorter);
  secondArray.sort(numberSorter);
  thirdArray.sort(numberSorter);

  var finalSum = 0;

  for (var iterationIdx = 0; iterationIdx < elementCount; iterationIdx++) {
    var lowerCount = findThreshold(firstArray, secondArray[iterationIdx], true);
    var upperCount = findThreshold(thirdArray, secondArray[iterationIdx], false);
    finalSum += lowerCount * upperCount;
  }

  printOutput(finalSum);
}

/**
 * A standard numeric comparison function for sorting in ascending order.
 * @param {number} val1 - The first value for comparison.
 * @param {number} val2 - The second value for comparison.
 * @returns {number} A negative value if val1 < val2, positive if val1 > val2, zero if equal.
 */
function numberSorter(val1, val2) {
  return val1 - val2;
}

/**
 * Performs a modified binary search on a sorted array to count elements
 * either less than or greater than a specific query value.
 *
 * @param {Array<number>} targetArr        The sorted array to perform the search on.
 * @param {number}        queryVal         The value to search for within the array.
 * @param {boolean}       isLowerBoundSearch If true, counts elements strictly less than queryVal.
 *                                         If false, counts elements strictly greater than queryVal.
 * @returns {number} The count of elements based on the search criteria.
 */
function findThreshold(targetArr, queryVal, isLowerBoundSearch) {
  var lowPtr = -1;
  var highPtr = targetArr.length;

  while (Math.abs(highPtr - lowPtr) > 1) {
    var midpoint = Math.floor((highPtr + lowPtr) / 2);
    if (isLowerBoundSearch) {
      if (targetArr[midpoint] >= queryVal) {
        highPtr = midpoint;
      } else {
        lowPtr = midpoint;
      }
    } else {
      if (targetArr[midpoint] > queryVal) {
        highPtr = midpoint;
      } else {
        lowPtr = midpoint;
      }
    }
  }

  if (isLowerBoundSearch) {
    return lowPtr + 1;
  } else {
    if (highPtr !== targetArr.length && targetArr[highPtr] === queryVal) {
      lowPtr++;
    }
    return targetArr.length - (lowPtr + 1);
  }
}