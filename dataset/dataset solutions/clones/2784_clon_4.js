const processDataStream = (rawText) => {
  const textLines = rawText.split('\n');
  const numberSeries = textLines[1].split(' ').map(Number);

  const seriesLength = numberSeries.length;
  if (seriesLength < 3) {
    console.log(0);
    return;
  }

  const checkPositions = Array.from({ length: seriesLength - 2 }, (_, indexOffset) => indexOffset + 1);

  const orderedElementCounter = checkPositions.reduce((accumulator, currentIdx) => {
    const initialTerm = numberSeries[currentIdx - 1];
    const middleTerm = numberSeries[currentIdx];
    const finalTerm = numberSeries[currentIdx + 1];

    if ((initialTerm < middleTerm && middleTerm < finalTerm) ||
        (initialTerm > middleTerm && middleTerm > finalTerm)) {
      return accumulator + 1;
    }
    return accumulator;
  }, 0);

  console.log(orderedElementCounter);
};

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));