var processSequence = function(rawTextualData) {
  "use strict";

  var lineSeparator = "\n";
  var valueSeparator = " ";

  var parseInteger = function(str) {
    return parseInt(str, 10);
  };

  var splitIntoRows = function(fullText, separator) {
    return fullText.split(separator);
  };

  var extractFirstRow = function(rowsList) {
    return rowsList.shift();
  };

  var parseNumericRow = function(rowString, separator) {
    var stringValues = rowString.split(separator);
    var numericArray = [];
    for (var i = 0; i < stringValues.length; i++) {
      numericArray.push(parseInteger(stringValues[i]));
    }
    return numericArray;
  };

  // Recursive function to build the derived sequence
  var generateFinalSequence = function(remainingSourceValues, currentAccumulatedElements) {
    if (remainingSourceValues.length === 0) {
      return currentAccumulatedElements;
    }

    var lastAccumulatedElement = currentAccumulatedElements[currentAccumulatedElements.length - 1];
    var firstOfRemaining = remainingSourceValues[0];
    var baseForNextAccumulation = currentAccumulatedElements.slice(0, -1); // Immutable pop

    var elementsToAppend;
    if (lastAccumulatedElement > firstOfRemaining) {
      elementsToAppend = [firstOfRemaining, firstOfRemaining];
    } else {
      elementsToAppend = [lastAccumulatedElement, firstOfRemaining];
    }

    var nextAccumulatedElements = baseForNextAccumulation.concat(elementsToAppend); // Immutable push
    var nextRemainingSourceValues = remainingSourceValues.slice(1); // Immutable shift

    return generateFinalSequence(nextRemainingSourceValues, nextAccumulatedElements);
  };

  // Recursive function to sum the elements
  var aggregateElements = function(elementsToSum, currentTotal) {
    if (elementsToSum.length === 0) {
      return currentTotal;
    }
    var firstElement = elementsToSum[0];
    var restElements = elementsToSum.slice(1);
    return aggregateElements(restElements, currentTotal + firstElement);
  };

  var textRows = splitIntoRows(rawTextualData, lineSeparator);

  var initialCount = parseInteger(extractFirstRow(textRows)); // The value N, not directly used in sum logic
  var baseNumerics = parseNumericRow(extractFirstRow(textRows), valueSeparator);

  var initialDerivedElements;
  if (baseNumerics.length === 0) {
      initialDerivedElements = [];
  } else {
      // The original code's initial `an = [bn[0]]` then `forEach` processes `bn[0]`.
      // This means the array effectively becomes `[bn[0], bn[0]]` after the first step.
      initialDerivedElements = [baseNumerics[0], baseNumerics[0]];
  }

  var sourceValuesForProcessing = baseNumerics.slice(1); // Start processing from the second element of baseNumerics

  var resultingElements = generateFinalSequence(sourceValuesForProcessing, initialDerivedElements);
  var finalAggregation = aggregateElements(resultingElements, 0);

  console.log(finalAggregation);
};

// This line must remain unchanged as it's the standard input/output handling for this environment
processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));