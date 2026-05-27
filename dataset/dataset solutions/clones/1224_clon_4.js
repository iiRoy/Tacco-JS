'use strict';

function presentNumericSequence(sequence) {
  console.log(sequence);
}

(function(sourceHandle) {
  let fullInputContent = sourceHandle.toString();

  let newlinePosition = fullInputContent.indexOf('\n');
  let relevantLine = (newlinePosition === -1) ? fullInputContent : fullInputContent.substring(0, newlinePosition);

  let stringSegments = [];
  let currentPosition = 0;
  let delimiterPosition;

  while ((delimiterPosition = relevantLine.indexOf(' ', currentPosition)) !== -1) {
    stringSegments.push(relevantLine.substring(currentPosition, delimiterPosition));
    currentPosition = delimiterPosition + 1;
  }
  stringSegments.push(relevantLine.substring(currentPosition));

  let numericResults = [];
  for (const segment of stringSegments) {
    numericResults.push(Number(segment));
  }

  presentNumericSequence(numericResults);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
