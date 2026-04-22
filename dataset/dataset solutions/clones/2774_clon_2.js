/*
 * This section handles input/output operations.
 * It's generally boilerplate for competitive programming.
 */
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var receivedLines = [];
var dataStream;
inputReader.on('line', function(singleLineInput) {
  receivedLines.push(singleLineInput);
});
inputReader.on('close', function() {
  dataStream = initializeStream(receivedLines);
  console.error('\n↑ Input Data ↓ Output Results');
  executeMainLogic();
});

function duplicateObject(originalEntity) {
  return (originalEntity instanceof Set) ? new Set(Array.from(originalEntity)) : JSON.parse(JSON.stringify(originalEntity));
}

function retrieveInteger() {
  return transformInput(getNextItem(), 1);
}

function retrieveStringArray() {
  return transformInput(getNextItem(), 2);
}

function retrieveIntegerArray() {
  return transformInput(getNextItem(), 4);
}

function retrieveCharacterArray() {
  return transformInput(getNextItem(), 6);
}

function getNextItem() {
  return dataStream.getNext();
}

function hasMoreItems() {
  return dataStream.hasMore();
}

function initializeStream(inputArray) {
  return {
    lineContents: inputArray,
    currentPosition: 0,
    maximumLength: inputArray.length,
    hasMore: function() {
      return (this.currentPosition < this.maximumLength);
    },
    getNext: function() {
      if (this.hasMore()) {
        return this.lineContents[this.currentPosition++];
      } else {
        throw 'EndOfInputReachedError: No further input available';
      }
    }
  };
}

function displayResult(outputValue) {
  console.log(outputValue);
}

function logDebugMessage(debugContent) {
  console.error('debug-info: ' + require('util').inspect(debugContent, false, null));
}

/*
 * This utility function converts input based on a specified mode.
 * Mode 1: Parse to integer.
 * Mode 2: Split by space.
 * Mode 4: Split by space and convert to numbers.
 * Mode 6: Split into characters.
 * Mode 7: Split into characters and convert to numbers.
 * Mode 8: Join array elements with spaces.
 * Mode 9: Join array elements with newlines.
 * Mode 0: Join array elements without separator.
 * Any other mode or error: Return input as is.
 */
function transformInput(inputVal, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(' ');
      case 4:
        return inputVal.split(' ').map(Number);
      case 6:
        return inputVal.split('');
      case 7:
        return inputVal.split('').map(Number);
      case 8:
        return inputVal.join(' ');
      case 9:
        return inputVal.join('\n');
      case 0:
        return inputVal.join('');
      default:
        return inputVal;
    }
  } catch (err) {
    return inputVal;
  }
}

/*
 * End of helper functions.
 */

function executeMainLogic() {
  var firstInputLine = retrieveIntegerArray();
  var nodeCount = firstInputLine[0];
  var maxColors = firstInputLine[1];

  var nodeCollection = new Array(nodeCount);
  for (var idx = 0; idx < nodeCount; idx++) {
    nodeCollection[idx] = {
      childrenConnections: [],
      nodeIdentifier: idx,
      assignedColorCount: 0,
      visitedFlag: false
    };
  }

  for (var idx = 0; idx < nodeCount - 1; idx++) {
    var tempConnections = retrieveIntegerArray();
    nodeCollection[tempConnections[0] - 1].childrenConnections.push(tempConnections[1] - 1);
    nodeCollection[tempConnections[1] - 1].childrenConnections.push(tempConnections[0] - 1);
  }

  var finalProduct = 1;
  var moduloValue = 1000000007;

  nodeCollection[0].visitedFlag = true;
  traverseAndColor(0, maxColors, 0, maxColors);

  for (var idx = 0; idx < nodeCount; idx++) {
    finalProduct *= nodeCollection[idx].assignedColorCount;
    finalProduct %= moduloValue;
  }
  displayResult(finalProduct);

  function traverseAndColor(parentVisitedCount, availableColors, currentNodeIndex, initialMaxColors) {
    nodeCollection[currentNodeIndex].assignedColorCount = availableColors;

    // Increment parent node count if less than 2
    if (parentVisitedCount < 2) {
      parentVisitedCount++;
    }

    var currentChildren = nodeCollection[currentNodeIndex].childrenConnections;
    var successfulChildAssignments = 0;

    for (var iLoop = 0; iLoop < currentChildren.length; iLoop++) {
      if (!nodeCollection[currentChildren[iLoop]].visitedFlag) {
        nodeCollection[currentChildren[iLoop]].visitedFlag = true;
        // Recursively call for children, adjusting available colors
        traverseAndColor(parentVisitedCount, initialMaxColors - successfulChildAssignments - parentVisitedCount, currentChildren[iLoop], initialMaxColors);
        successfulChildAssignments++;
      }
    }
  }
}