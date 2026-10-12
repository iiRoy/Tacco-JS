'use strict';(function(sourceData){
  const processedNumbers = sourceData.trim().split(/\s+/).map(Number);
  const firstParameter = processedNumbers[0];
  const secondParameter = processedNumbers[1];

  const rangeStart = secondParameter - firstParameter + 1;
  const rangeEnd = secondParameter + firstParameter - 1;

  const sequenceLength = rangeEnd - rangeStart + 1;

  const generatedSequence = Array.from({ length: sequenceLength }, (_, index) => rangeStart + index);

  console.log(generatedSequence.join(' '));
})(require('fs').readFileSync('/dev/stdin','utf8'));
