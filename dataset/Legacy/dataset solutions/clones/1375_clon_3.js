function processInputData(inputLines) {
  let lineIndex = 0;
  while (true) {
    const currentLineContent = inputLines[lineIndex];

    if (currentLineContent === '0 0') {
      break;
    }

    const { limitN, targetX } = extractNumericParameters(currentLineContent);

    const validCombinationCount = computeTripletsSummingToTarget(limitN, targetX);

    console.log(validCombinationCount);
    lineIndex++;
  }
}

function extractNumericParameters(lineString) {
  const stringParts = lineString.split(/\s+/);
  const nValue = parseInt(stringParts[0], 10);
  const xValue = parseInt(stringParts[1], 10);
  return { limitN: nValue, targetX: xValue };
}

function computeTripletsSummingToTarget(upperBound, desiredSum) {
  let foundWays = 0;
  for (let firstNum = 1; firstNum <= upperBound; firstNum++) {
    for (let secondNum = firstNum + 1; secondNum <= upperBound; secondNum++) {
      for (let thirdNum = secondNum + 1; thirdNum <= upperBound; thirdNum++) {
        const currentTripletSum = firstNum + secondNum + thirdNum;
        if (currentTripletSum === desiredSum) {
          foundWays++;
        }
      }
    }
  }
  return foundWays;
}

const receivedBufferParts = [];
process.stdin.on('data', function(dataChunk) {
  receivedBufferParts.push(dataChunk);
});
process.stdin.on('end', function() {
  const allInputLines = receivedBufferParts.join('').split('\n');
  processInputData(allInputLines);
});
