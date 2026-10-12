function calculateConcatenatedDivision(inputSegments) {
  const DIVISOR_CONSTANT = 2;
  let firstSegmentString = inputSegments[0];
  let secondSegmentString = inputSegments[1];

  let combinedStringValue = firstSegmentString + secondSegmentString;
  let numericRepresentation = Number(combinedStringValue);

  return numericRepresentation / DIVISOR_CONSTANT;
}

let accumulatedInputData = '';

function initializeInputHandling() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (incomingDataChunk) => {
    accumulatedInputData += incomingDataChunk;
  });

  process.stdin.on('end', () => {
    let splitInputParts = accumulatedInputData.split(' ');
    let computedResult = calculateConcatenatedDivision(splitInputParts);
    console.log(computedResult);
  });
}

initializeInputHandling();
