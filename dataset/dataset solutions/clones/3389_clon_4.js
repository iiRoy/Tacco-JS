'use strict'

const performTransformationPass = (initialArrangement) => {
  let currentIdx = 0;
  let newArrangement = [];
  let currentPassSwaps = 0;

  while (currentIdx < initialArrangement.length) {
    if (
      currentIdx + 1 < initialArrangement.length &&
      initialArrangement[currentIdx] === 'B' &&
      initialArrangement[currentIdx + 1] === 'W'
    ) {
      newArrangement.push('W');
      newArrangement.push('B');
      currentPassSwaps++;
      currentIdx += 2;
    } else {
      newArrangement.push(initialArrangement[currentIdx]);
      currentIdx++;
    }
  }
  return {
    nextArrangement: newArrangement.join(''),
    swapsInPass: currentPassSwaps,
  };
};

const calculateAccumulatedSwaps = (currentArrangement, totalSwapsSoFar) => {
  const passResult = performTransformationPass(currentArrangement);
  if (passResult.swapsInPass === 0) {
    return totalSwapsSoFar;
  } else {
    return calculateAccumulatedSwaps(
      passResult.nextArrangement,
      totalSwapsSoFar + passResult.swapsInPass
    );
  }
};

const processInputData = (incomingData) => {
  const firstLine = incomingData.split('\n')[0];
  const finalOutcome = calculateAccumulatedSwaps(firstLine, 0);
  console.log(finalOutcome);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));