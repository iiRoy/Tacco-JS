'use strict';
(function(inputSource){
  let processedInput = inputSource.trim().split(/\n/);
  const numMen = +processedInput.shift();
  const maskLimit = 1 << numMen;
  const modVal = 1000000007;

  const matchMatrix = processedInput.map(line => line.split(/\s+/).map(val => +val));

  const dpTable = new Array(maskLimit).fill(0);

  dpTable[0] = 1;

  for (let currentMask = 1; currentMask < maskLimit; currentMask++) {
    let menCount = 0;
    for (let bitPosition = 0; bitPosition < numMen; bitPosition++) {
      if ((currentMask >> bitPosition) & 1) {
        menCount++;
      }
    }

    const currentManIndex = menCount - 1;

    if (currentManIndex < 0) continue;

    for (let womanCandidateIndex = 0; womanCandidateIndex < numMen; womanCandidateIndex++) {
      if ((currentMask & (1 << womanCandidateIndex)) !== 0) {
        if (matchMatrix[currentManIndex][womanCandidateIndex] === 1) {
          const previousWomenMask = currentMask ^ (1 << womanCandidateIndex);
          dpTable[currentMask] = (dpTable[currentMask] + dpTable[previousWomenMask]) % modVal;
        }
      }
    }
  }

  console.log(dpTable[maskLimit - 1] || 0);
})(require('fs').readFileSync('/dev/stdin','utf8'));
