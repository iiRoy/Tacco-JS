'use strict';

function processInput(sourceData) {
  const firstRelevantLine = sourceData.split('\n')[0];
  const targetCharacterPattern = /1/g;
  const matchedInstances = firstRelevantLine.match(targetCharacterPattern);
  const finalTally = matchedInstances ? matchedInstances.length : 0;
  console.log(finalTally);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
