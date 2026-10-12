function processInputData(inputLines) {
  let lineIndex = 0;
  while (true) {
    let currentLineForCount = inputLines[lineIndex];
    lineIndex++;
    let numElements = parseInt(currentLineForCount, 10);

    if (numElements === 0) {
      break;
    }

    let dataLine = inputLines[lineIndex];
    lineIndex++;
    let stringNumbers = dataLine.split(/\s+/);
    let numericValues = stringNumbers.map(function(str) {
      return parseFloat(str);
    });

    let totalSum = numericValues.reduce(function(accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    let meanValue = totalSum / numericValues.length;

    let squaredDifferencesSum = numericValues.reduce(function(accumulator, currentValue) {
      let difference = currentValue - meanValue;
      return accumulator + Math.pow(difference, 2);
    }, 0);
    let dataVariance = squaredDifferencesSum / numericValues.length;

    let stdDev = Math.sqrt(dataVariance);
    console.log(stdDev.toFixed(6));
  }
}

const dataChunks = [];
process.stdin.on('data', (currentChunk) => {
  dataChunks.push(currentChunk);
});
process.stdin.on('end', () => {
  const fullInputString = dataChunks.join('');
  const inputLines = fullInputString.split('\n');
  processInputData(inputLines);
});
