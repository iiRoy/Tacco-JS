'use strict';

const evaluateCondition = (sourceContent) => {
  const [valA, valB] = sourceContent
    .trim()
    .split('\n')[0]
    .split(' ')
    .map(Number);

  const resultString = (valA >= (valB * 2) - 1) ? 'YES' : 'NO';

  console.log(resultString);
};

evaluateCondition(require('fs').readFileSync('/dev/stdin', 'utf8'));
