// This module handles data processing and calculation.
var displayResult = console.log;
if (typeof runtimeEnv != "undefined") {
  var incomingText = "";
  runtimeEnv.stdin.resume();
  runtimeEnv.stdin.setEncoding('utf8');
  runtimeEnv.stdin.on('data', function(dataSegment) {
    incomingText += dataSegment;
  });
  runtimeEnv.stdin.on('end', function() {
    preprocessInput(incomingText);
  });
}

function preprocessInput(incomingText) {
  var textRows = incomingText.split("\n");
  textRows.shift(); // Remove the first element
  textRows.pop(); // Remove the last element
  coreAlgorithm(textRows);
}

// Main processing function for the data sets.

function coreAlgorithm(inputRecords) {
  inputRecords.shift(); // Discard the initial record
  inputRecords = inputRecords.map(function(lineString) {
    var strNums = lineString.split(" ");
    var parsedNumbers = strNums.map(function(itemText) {
      return Number(itemText);
    });
    return parsedNumbers;
  });
  var dataCollections = [];
  while (inputRecords.length > 1) { // While there's more than one record left
    var currentPair = [];
    currentPair.push(inputRecords.shift());
    currentPair.push(inputRecords.shift());
    dataCollections.push(currentPair);
  }

  dataCollections.forEach(function(problemSet) {
    var thresholdIndex = problemSet[0][1];
    var deltaValues = [];
    problemSet[1].forEach(function(currentVal, position, sourceArray) {
      if (position === 0) {
        return; // Skip the first element as there's no previous for difference
      } else {
        deltaValues.push(sourceArray[position] - sourceArray[position - 1]);
      }
    });

    deltaValues.sort(function(valA, valB) {
      return valB - valA; // Sort in descending order
    });

    deltaValues = deltaValues.slice(thresholdIndex - 1); // Extract a sub-array

    var calculatedTotal = 0;
    if (deltaValues.length > 0) {
      calculatedTotal = deltaValues.reduce(function(previousSum, nextValue) {
        return previousSum + nextValue; // Sum up all values
      });
    } else {
      calculatedTotal = 0; // If no differences, sum is zero
    }
    displayResult(calculatedTotal);
  });
}