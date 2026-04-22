const generatePairedSequence = (sourceLines) => {
  if (!sourceLines || sourceLines.length === 0) {
    console.error("No input lines were provided for sequence generation.");
    return;
  }

  const firstLineData = sourceLines[0];
  if (!firstLineData || firstLineData.trim() === '') {
    console.error("The first line of input is empty or invalid.");
    return;
  }

  const initialParams = firstLineData.split(' ').map(valStr => parseInt(valStr.trim(), 10));

  let totalElements = initialParams[0];
  let iterationsNeeded = initialParams[1];

  if (isNaN(totalElements) || isNaN(iterationsNeeded) || totalElements < 1 || iterationsNeeded < 0) {
    console.error("Invalid numeric parameters for sequence generation. Please ensure positive integers for elements and non-negative for iterations.");
    return;
  }

  if (iterationsNeeded === 0) {
    return; // No pairs to generate
  }

  const isTotalElementsOdd = (totalElements % 2 !== 0);

  if (isTotalElementsOdd) {
    let currentLowerBound = 1;
    let currentUpperBound = totalElements - 1;

    for (let count = 0; count < iterationsNeeded; count++) {
      const outputPairString = currentLowerBound + ' ' + currentUpperBound;
      console.log(outputPairString);

      currentLowerBound++;
      currentUpperBound--;
    }
  } else {
    const halfValue = totalElements / 2;

    let currentLeftValue = halfValue;
    let currentRightValue = halfValue + 1;

    while (iterationsNeeded > 0) {
      console.log(`${currentLeftValue} ${currentRightValue}`);

      currentLeftValue--;
      currentRightValue++;
      iterationsNeeded--;
    }
  }
};

let accumulatedInputBuffer = '';

process.stdin.on('data', (inputChunk) => {
  accumulatedInputBuffer += inputChunk;
});

process.stdin.on('end', () => {
  const { EOL: systemLineBreak } = require('os');
  const processedInputLines = accumulatedInputBuffer.split(systemLineBreak);

  generatePairedSequence(processedInputLines);
});