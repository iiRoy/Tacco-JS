(function() {
  'use strict';

  var collectedInputLines = [];

  // Introduce a constant for the split index
  const SEGMENT_SPLIT_POSITION = 4;

  // Split the readline interface creation and event attachment
  const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Define a small helper function for string manipulation
  function createFormattedSegment(sourceString, splitPoint) {
    const firstPart = sourceString.substring(0, splitPoint);
    const secondPart = sourceString.substring(splitPoint);
    return firstPart + ' ' + secondPart;
  }

  inputProcessor.on('line', function(currentInputLine) {
    collectedInputLines.push(currentInputLine);
  });

  process.stdin.on('end', function() {
      // Use the helper function to process the first collected line
      const processedOutput = createFormattedSegment(collectedInputLines[0], SEGMENT_SPLIT_POSITION);
      console.log(processedOutput);
  });
})();
