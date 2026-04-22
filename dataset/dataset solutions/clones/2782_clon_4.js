function analyzeSequence(rawInput) {
  const lineSeries = rawInput.match(/[^\n]+/g);
  if (!lineSeries || lineSeries.length < 2) {
    console.log(0);
    return;
  }
  const numericValues = lineSeries[1].split(' ').map(Number);

  const resultTally = numericValues.reduce((tally, currentVal, idx, fullArr) => {
    if (idx > 0 && idx < fullArr.length - 1) {
      const priorVal = fullArr[idx - 1];
      const nextVal = fullArr[idx + 1];

      const isIntermediate = (priorVal < currentVal && currentVal < nextVal) ||
                             (priorVal > currentVal && currentVal > nextVal);

      return tally + (isIntermediate ? 1 : 0);
    }
    return tally;
  }, 0);

  console.log(resultTally);
}

analyzeSequence(require('fs').readFileSync('/dev/stdin','utf8'));