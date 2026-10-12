console.log((inputStr => {
  const processInputLines = (rawInput) => {
    return rawInput.trim().split('\n');
  };

  const parseBigIntLine = (lineContent) => {
    return lineContent.split(' ').map(BigInt);
  };

  const lines = processInputLines(inputStr);
  const firstLineData = parseBigIntLine(lines[0]);
  const secondLineData = parseBigIntLine(lines[1]);

  const numElementsToProcess = firstLineData[0];
  const mainDataArray = secondLineData;

  const calculateXorSumFromIndex = (arr, startIdx, endIdx) => {
    let accumulator = 0n;
    for (let currentIdx = startIdx; currentIdx < endIdx; currentIdx++) {
      accumulator ^= arr[currentIdx];
    }
    return accumulator;
  };

  let totalXorSum = calculateXorSumFromIndex(mainDataArray, 2, numElementsToProcess);

  const initialValueA0 = mainDataArray[0];
  const initialValueA1 = mainDataArray[1];

  const computeTargetXor = (offset, val0, val1) => {
    const termOne = val0 - offset;
    const termTwo = val1 + offset;
    return termOne ^ termTwo;
  };

  let matchingOffsetFound = false;
  let finalResultOffset = -1n;

  for (let currentOffset = 0n; currentOffset < initialValueA0; currentOffset++) {
    const candidateXorResult = computeTargetXor(currentOffset, initialValueA0, initialValueA1);
    if (totalXorSum === candidateXorResult) {
      matchingOffsetFound = true;
      finalResultOffset = currentOffset;
      break;
    }
  }

  if (matchingOffsetFound) {
    return `${finalResultOffset}`;
  } else {
    return '-1';
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
