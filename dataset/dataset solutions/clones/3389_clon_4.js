'use strict'

const processSequence = (inputString) => {
  let currentSequence = inputString.split('\n')[0];
  let totalOperations = 0;
  let hasChanges = true;

  while (hasChanges) {
    hasChanges = false;
    let nextSequenceChars = [];
    let currentIdx = 0;
    let operationsInPass = 0;

    while (currentIdx < currentSequence.length) {
      if (currentIdx + 1 < currentSequence.length &&
          currentSequence[currentIdx] === 'B' &&
          currentSequence[currentIdx + 1] === 'W') {
        
        nextSequenceChars.push('W');
        nextSequenceChars.push('B');
        operationsInPass++;
        currentIdx += 2; // Consume both 'B' and 'W'
        hasChanges = true;
      } else {
        nextSequenceChars.push(currentSequence[currentIdx]);
        currentIdx++;
      }
    }
    
    if (hasChanges) {
      totalOperations += operationsInPass;
      currentSequence = nextSequenceChars.join('');
    }
  }
  console.log(totalOperations);
};

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
