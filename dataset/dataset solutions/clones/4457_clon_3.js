process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputSegments = [];

const inputCollector = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputCollector.on('line', (currentInputLine) => {
  inputSegments.push(currentInputLine);
});

inputCollector.on('close', () => {
  const rawUpperBoundStr = inputSegments[0];
  let processedUpperBound = parseInt(rawUpperBoundStr, 10);

  if (isNaN(processedUpperBound) || processedUpperBound < 1) {
    console.error("Error: Input must be a positive integer.");
    process.exit(1);
  }

  const factorCounts = new Array(processedUpperBound).fill(0);

  for (let currentVal = 1; currentVal <= processedUpperBound; ++currentVal) {
    let tempNumForCalculation = currentVal;
    let currentFactorOfTwoCount = 0;

    while ((tempNumForCalculation & 1) === 0 && tempNumForCalculation > 0) {
      currentFactorOfTwoCount++;
      tempNumForCalculation >>= 1;
    }

    factorCounts[currentVal - 1] = currentFactorOfTwoCount;
  }

  let overallMaxCount = -1;
  let firstOccurrenceIndex = -1;

  for (let idx = 0; idx < factorCounts.length; ++idx) {
    const currentCountValue = factorCounts[idx];

    if (currentCountValue > overallMaxCount) {
      overallMaxCount = currentCountValue;
      firstOccurrenceIndex = idx;
    }
  }

  const finalResult = firstOccurrenceIndex + 1;
  process.stdout.write(String(finalResult) + '\n');
});