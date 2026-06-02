function processInputData(rawData) {
  const lineSegments = rawData.split('\n');
  const itemCount = Number(lineSegments[0]);
  const valueStrings = lineSegments[1].split(' ');
  const costStrings = lineSegments[2].split(' ');

  const numericValues = valueStrings.map(Number);
  const numericCosts = costStrings.map(Number);

  const totalGain = numericValues.reduce((accumulatedProfit, currentVal, index) => {
    const correspondingCost = numericCosts[index];
    return accumulatedProfit + Math.max(0, currentVal - correspondingCost);
  }, 0);

  console.log(totalGain);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
