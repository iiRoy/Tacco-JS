function processInput(allLines, currentLineIndex = 0) {
  const itemCountString = allLines[currentLineIndex];
  const currentItemCount = Number(itemCountString);

  if (currentItemCount === 0) {
    return;
  }

  const dataLine = allLines[currentLineIndex + 1];
  const numericValues = dataLine.split(/\s+/).map(Number);

  function computeStats(valuesArray) {
    let sumOfValues = 0;
    for (const val of valuesArray) {
      sumOfValues += val;
    }
    const meanValue = sumOfValues / valuesArray.length;

    let sumOfSquaredDeviations = 0;
    for (const val of valuesArray) {
      sumOfSquaredDeviations += Math.pow(val - meanValue, 2);
    }
    const dataVariance = sumOfSquaredDeviations / valuesArray.length;

    return Math.sqrt(dataVariance);
  }

  const resultDeviation = computeStats(numericValues);
  console.log(resultDeviation.toFixed(6));

  processInput(allLines, currentLineIndex + 2);
}

const inputParts = [];
process.stdin.on('data', (part) => {
  inputParts.push(part);
});
process.stdin.on('end', () => {
  const allLines = inputParts.join('').split('\n');
  processInput(allLines);
});
