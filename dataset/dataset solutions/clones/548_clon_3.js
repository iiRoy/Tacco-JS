let processedInputLines = [];

function processInputData() {
  const RADIX_DECIMAL = 10;
  let sumA = 0;
  let sumB = 0;

  const numEntries = parseInt(processedInputLines[0], RADIX_DECIMAL);
  const dataLines = processedInputLines.slice(1);

  const calculateDeltasForLine = (entryString) => {
    const currentLineParts = entryString.split(' ').map(parseFloat);
    const valX = currentLineParts[0];
    const valY = currentLineParts[1];

    let currentDeltaA = 0;
    let currentDeltaB = 0;

    const sumOfValues = valX + valY;

    if (valX > valY) {
      currentDeltaA = sumOfValues;
    } else if (valX < valY) {
      currentDeltaB = sumOfValues;
    } else {
      currentDeltaA = valX;
      currentDeltaB = valY;
    }
    return { deltaA: currentDeltaA, deltaB: currentDeltaB };
  };

  for (let idx = 0; idx < numEntries; idx++) {
    const { deltaA, deltaB } = calculateDeltasForLine(dataLines[idx]);
    sumA += deltaA;
    sumB += deltaB;
  }

  console.log("%d %d", sumA, sumB);
}

let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawDataBuffer += chunk;
});
process.stdin.on('end', function() {
  processedInputLines = rawDataBuffer.split('\n');
  processInputData();
});
