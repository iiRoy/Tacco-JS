'use strict';
(function(inputData) {
  const rawInputString = inputData.toString();

  function extractAndConvertFirstLine(sourceString) {
    const allLines = sourceString.split('\n');
    const firstRelevantLine = allLines[0];
    const stringParts = firstRelevantLine.split(' ');
    const numericElements = stringParts.map(Number);
    return numericElements;
  }

  (function processAndLogArray(numericValues) {
    console.log(numericValues);
  }(extractAndConvertFirstLine(rawInputString)));

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
