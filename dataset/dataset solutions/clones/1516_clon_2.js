// Internal utility functions. Begin.
var inputReader = require('readline')
  .createInterface({
    input: process.stdin,
    output: process.stdout
  });
var dataStore;
var receivedLines = [];
inputReader.on('line', function (currentLineText) {
  receivedLines.push(currentLineText);
});
inputReader.on('close', function () {
  dataStore = initializeData(receivedLines);
  console.error('\n↑Input ↓Output');
  primaryExecution();
});

function duplicateObject(original) {
  return (original instanceof Set) ? new Set(Array.from(original)) : JSON.parse(JSON.stringify(original));
}

function retrieveInteger() {
  return transformValue(retrieveNextItem(), 1);
}

function retrieveStringArray() {
  return transformValue(retrieveNextItem(), 2);
}

function retrieveIntegerArray() {
  return transformValue(retrieveNextItem(), 4);
}

function retrieveCharacterArray() {
  return transformValue(retrieveNextItem(), 6);
}

function retrieveNextItem() {
  return dataStore.next();
}

function hasMoreItems() {
  return dataStore.hasNext();
}

function initializeData(inputCollection) {
  return {
    sourceData: inputCollection,
    currentIndex: 0,
    maximumItems: inputCollection.length,
    hasNext: function () {
      return (this.currentIndex < this.maximumItems);
    },
    next: function () {
      if (this.hasNext()) {
        return this.sourceData[this.currentIndex++];
      } else {
        throw 'DataAccessException: No more items to retrieve.';
      }
    }
  };
}

function outputResult(finalOutput) {
  console.log(finalOutput);
}

function logError(errorInfo) {
  console.error('Debug Log:' + require('util')
    .inspect(errorInfo, false, null));
}

// Transformation type codes:
// 1: Parse to integer.
// 2: Split by spaces.
// 4: Split by spaces and convert to numbers.
// 6: Split into individual characters.
// 7: Split into characters and convert to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without separator.
// Default: Return original value.
function transformValue(inputValue, transformationType) {
  try {
    switch (transformationType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ')
          .map(Number);
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('')
          .map(Number);
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  } catch (err) {
    return inputValue;
  }
}
// End of internal utilities.
function primaryExecution() {
  var initialParams = retrieveIntegerArray();
  var arraySize = initialParams[0];
  var segmentCount = initialParams[1];
  var moduloVal = 998244353;
  var dynamicProgression = new Array(arraySize).fill(0);
  var cumulativeSum = new Array(arraySize).fill(0);
  dynamicProgression[0] = 1;
  cumulativeSum[0] = 1;
  var segmentRanges = new Array(segmentCount);
  // Populate the list of valid segments
  for (var idxA = 0; idxA < segmentCount; idxA += 1) {
    var rangeValues = retrieveIntegerArray();
    segmentRanges[idxA] = {
      leftBound: rangeValues[0],
      rightBound: rangeValues[1]
    };
  }

  // Iterate through states for dynamic programming
  for (var currentIdx = 1; currentIdx < arraySize; ++currentIdx) {
    // Apply each segment rule
    for (var segmentIdx = 0; segmentIdx < segmentCount; segmentIdx++) {
      var currentSegment = segmentRanges[segmentIdx];
      if (currentIdx - currentSegment.leftBound < 0) {
        continue; // Segment starts too far for current index
      }

      if (currentSegment.leftBound === currentSegment.rightBound) {
        dynamicProgression[currentIdx] += dynamicProgression[currentIdx - currentSegment.leftBound];
      } else if (currentIdx - currentSegment.rightBound - 1 < 0) {
        dynamicProgression[currentIdx] += cumulativeSum[currentIdx - currentSegment.leftBound];
      } else {
        dynamicProgression[currentIdx] += cumulativeSum[currentIdx - currentSegment.leftBound] - cumulativeSum[currentIdx - currentSegment.rightBound - 1];
      }

      // Ensure result stays positive and within modulo
      if (dynamicProgression[currentIdx] < 0) {
        dynamicProgression[currentIdx] += moduloVal;
      }
      dynamicProgression[currentIdx] %= moduloVal;
    }
    // Update the cumulative sum for the current index
    cumulativeSum[currentIdx] = dynamicProgression[currentIdx] + cumulativeSum[currentIdx - 1];
    cumulativeSum[currentIdx] %= moduloVal;
  }
  // Output the final computed value
  outputResult(dynamicProgression[arraySize - 1]);
}