'use strict';

const computeResult = ( rawInputData ) => {
  const inputParts = rawInputData.split(' ');
  const upperLimit = parseInt(inputParts[0], 10);
  const dividerValue = parseInt(inputParts[1], 10);

  // If (a+b) is a multiple of D and (a+c) is a multiple of D,
  // then (b-c) must also be a multiple of D.
  // Similarly, (a-b) and (a-c) are also multiples of D.
  let firstRemainderMap = {};
  let secondRemainderMap = {};
  let finalAccumulator = 0;

  for (let currentVal = 1; currentVal <= upperLimit; currentVal++) {
    let currentMod = currentVal % dividerValue;
    let requiredMod = dividerValue - currentMod;

    if (((requiredMod * 2) % dividerValue) === 0) {
      // This branch handles cases where (b+c) is always a multiple of D.
      // We need to count how many valid 'b' (or 'c') values exist.
      let pairCounter = firstRemainderMap[requiredMod];
      if (typeof pairCounter === 'undefined') {
        pairCounter = 0;
        for (let iterVal = requiredMod; iterVal <= upperLimit; iterVal += dividerValue) {
          pairCounter++;
        }
        firstRemainderMap[requiredMod] = pairCounter;
      }
      finalAccumulator += pairCounter * pairCounter;
    }
    else {
      // This branch handles cases where (b+c) is not always a multiple of D.
      // We count only the specific 'b' (or 'c') values that satisfy the condition.
      let pairCounter = secondRemainderMap[requiredMod];
      if (typeof pairCounter === 'undefined') {
        pairCounter = 0;
        for (let iterVal = requiredMod; iterVal <= upperLimit; iterVal += dividerValue) {
          if (((iterVal * 2) % dividerValue) === 0) {
            pairCounter++;
          }
        }
        secondRemainderMap[requiredMod] = pairCounter;
      }
      finalAccumulator += pairCounter;
    }
  }

  console.log(finalAccumulator);
};

const isDevMode = false;

if (isDevMode) {
  computeResult('3 2');
  computeResult('5 3');
  computeResult('31415 9265');
  computeResult('35897 932');
}
else {
  computeResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
}