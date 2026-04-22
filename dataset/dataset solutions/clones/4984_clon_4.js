function processData(rawString) {
  const numericalSequence = Array.from(rawString, Number);
  const sequenceLength = numericalSequence.length;

  let finalResult = Number(rawString);

  Array.from({ length: sequenceLength }, (_, indexA) => {
    const prefixSum = numericalSequence.slice(0, indexA)
                                       .reduce((currentSum, val) => currentSum + val, 0);

    finalResult += segmentProcessor(numericalSequence, indexA, prefixSum);
  });

  return finalResult;
}

function segmentProcessor(numericalSequence, splitPointA, initialAccumulatedValue) {
  const sequenceLength = numericalSequence.length;
  let currentSegmentTotal = 0;

  Array.from({ length: sequenceLength - splitPointA - 1 }, (_, loopIndex) => {
    const splitPointB = splitPointA + (loopIndex + 1);

    currentSegmentTotal += initialAccumulatedValue;

    const middlePartString = numericalSequence.slice(splitPointA, splitPointB).join('');
    currentSegmentTotal += Number(middlePartString);

    const rightPartString = numericalSequence.slice(splitPointB).join('');
    currentSegmentTotal += Number(rightPartString);
  });

  return currentSegmentTotal;
}

console.log(processData(require('fs').readFileSync('/dev/stdin', 'utf8')));