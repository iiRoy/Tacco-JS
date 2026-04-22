// This section handles input acquisition and utility functions.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataFeed;
var cachedEntries = [];

inputReader.on('line', function(receivedDatum) {
  cachedEntries.push(receivedDatum);
});
inputReader.on('close', function() {
  dataFeed = setupSource(cachedEntries);
  console.error('\n↑ Input Data ↓ Output Results');
  ExecuteProgram();
});

function duplicateEntity(item) {
  return (item instanceof Set) ? new Set(Array.from(item)) : JSON.parse(JSON.stringify(item));
}

function fetchInteger() {
  return transformValue(advanceCursor(), 1);
}

function fetchStringCollection() {
  return transformValue(advanceCursor(), 2);
}

function fetchIntegerCollection() {
  return transformValue(advanceCursor(), 4);
}

function fetchCharacterCollection() {
  return transformValue(advanceCursor(), 6);
}

function advanceCursor() {
  return dataFeed.advanceCursor();
}

function canAdvance() {
  return dataFeed.canAdvance();
}

function setupSource(dataEntries) {
  return {
    sourceContent: dataEntries,
    currentPointer: 0,
    maxElements: dataEntries.length,
    canAdvance: function() {
      return (this.currentPointer < this.maxElements);
    },
    advanceCursor: function() {
      if (this.canAdvance()) {
        return this.sourceContent[this.currentPointer++];
      } else {
        throw 'InputOutOfBoundsException – No more data available for processing.';
      }
    }
  };
}

function displayResult(message) {
  console.log(message);
}

function reportError(debugMessage) {
  console.error('debug-info: ' + require('util').inspect(debugMessage, false, null));
}

// The 'conversionCode' parameter dictates the transformation type:
// Default or unknown: returns the value as is.
// 1: Parses to an integer.
// 2: Splits by space character.
// 4: Splits by space and converts to numbers.
// 6: Splits into individual characters.
// 7: Splits into characters and converts to numbers.
// 8: Joins array elements with spaces.
// 9: Joins array elements with newlines.
// 0: Joins array elements without any separator.
function transformValue(incomingValue, conversionCode) {
  try {
    switch (conversionCode) {
      case 1:
        return parseInt(incomingValue);
      case 2:
        return incomingValue.split(' ');
      case 4:
        return incomingValue.split(' ').map(Number);
      case 6:
        return incomingValue.split('');
      case 7:
        return incomingValue.split('').map(Number);
      case 8:
        return incomingValue.join(' ');
      case 9:
        return incomingValue.join('\n');
      case 0:
        return incomingValue.join('');
      default:
        return incomingValue;
    }
  } catch (err) {
    return incomingValue;
  }
}

// End of utility and input handling section.
function ExecuteProgram() {
  var initialParameters = fetchIntegerCollection();
  var nodeTotal = initialParameters[0];
  var colorAllowance = initialParameters[1];
  var graphNodes = new Array(nodeTotal);

  for (var idx = 0; idx < nodeTotal; idx++) {
    graphNodes[idx] = {
      connectedNeighbors: [],
      nodeIdentifier: idx,
      colorAllocation: 0,
      hasBeenVisited: false
    };
  }

  for (var idx = 0; idx < nodeTotal - 1; idx++) {
    var edgeData = fetchIntegerCollection();
    graphNodes[edgeData[0] - 1].connectedNeighbors.push(edgeData[1] - 1);
    graphNodes[edgeData[1] - 1].connectedNeighbors.push(edgeData[0] - 1);
  }

  var finalCalculation = 1;
  var modulusValue = 1000000007;

  graphNodes[0].hasBeenVisited = true;

  var processingQueue = [
    [0, colorAllowance, 0]
  ]; // [parent_excl, current_colors, current_node]

  while (processingQueue.length > 0) {
    var currentTask = processingQueue.pop();
    var parentColorExclusions = currentTask[0];
    var remainingColors = currentTask[1];
    var activeNodeIndex = currentTask[2];

    graphNodes[activeNodeIndex].colorAllocation = remainingColors;

    if (parentColorExclusions < 2) {
      parentColorExclusions++;
    }

    var neighborList = graphNodes[activeNodeIndex].connectedNeighbors;
    var childrenProcessedSuccessfully = 0;

    for (var idx = 0; idx < neighborList.length; idx++) {
      if (!graphNodes[neighborList[idx]].hasBeenVisited) {
        graphNodes[neighborList[idx]].hasBeenVisited = true;
        processingQueue.push([parentColorExclusions, colorAllowance - childrenProcessedSuccessfully - parentColorExclusions, neighborList[idx]]);
        childrenProcessedSuccessfully++;
      }
    }
  }

  for (var idx = 0; idx < nodeTotal; idx++) {
    finalCalculation *= graphNodes[idx].colorAllocation;
    finalCalculation %= modulusValue;
    if (finalCalculation === 0) {
      break;
    }
  }

  displayResult(finalCalculation);


  // This function is defined but not called in the current execution flow.
  function recursiveColoring(parentColorExclusions, remainingColors, activeNodeIndex, initialColorBudget) {
    graphNodes[activeNodeIndex].colorAllocation = remainingColors;
    if (parentColorExclusions < 2) {
      parentColorExclusions++;
    }
    var neighborList = graphNodes[activeNodeIndex].connectedNeighbors;
    var childrenProcessedSuccessfully = 0;
    for (var idx = 0; idx < neighborList.length; idx++) {
      if (!graphNodes[neighborList[idx]].hasBeenVisited) {
        graphNodes[neighborList[idx]].hasBeenVisited = true;
        recursiveColoring(parentColorExclusions, initialColorBudget - childrenProcessedSuccessfully - parentColorExclusions, neighborList[idx], initialColorBudget);
        childrenProcessedSuccessfully++;
      }
    }
  }
}