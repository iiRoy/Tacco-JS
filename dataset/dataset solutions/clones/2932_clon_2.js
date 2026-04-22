'use strict';
function processData(rawData) {
  rawData = rawData.trim() .split(' ');
  const factor = parseFloat(rawData[0]);
  const offset = parseFloat(rawData[1]);
  let resultSequence = [parseFloat(rawData[2])];

  for (let iterationIndex = 1; iterationIndex <= 10; ++iterationIndex) {
    resultSequence[iterationIndex] = factor * resultSequence[iterationIndex - 1] - offset;
  }

  resultSequence.shift();
  console.info(resultSequence.join('\n'));
}
processData( require('node:fs').readFileSync('/dev/fd/0', 'utf-8') );