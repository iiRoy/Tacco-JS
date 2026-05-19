'use strict';

function processInput(data) {
  const contentLines = data.split('\n').filter(Boolean);
  const elementCount = Number.parseInt(contentLines[0], 10);
  const numberSequence = contentLines[1].split(' ').map(Number.parseInt);
  console.log(checkSequence(numberSequence));
}

function checkSequence(initialSequence) {
  const originalOrder = initialSequence.slice();
  const workingCopy = initialSequence.slice();
  const orderedSequence = workingCopy.sort((a, b) => a - b);

  console.log(originalOrder);
  console.log(orderedSequence);

  let mismatchCounter = 0;
  const exceedsThreshold = originalOrder.some((elementValue, indexPosition) => {
    if (elementValue !== orderedSequence[indexPosition]) {
      mismatchCounter++;
    }
    return mismatchCounter > 2;
  });

  return exceedsThreshold ? 'NO' : 'YES';
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
