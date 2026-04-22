function processDataStream(sourceText) {
  const [coefficient, offset, initialPoint] = sourceText.split(/\s+/).map(val => Number(val));

  const sequenceIndices = Array.from({ length: 10 }, (_, k) => k + 1);

  sequenceIndices.reduce((priorValue, currentIteration) => {
    const nextCalculatedValue = coefficient * priorValue - offset;
    console.log(nextCalculatedValue);
    return nextCalculatedValue;
  }, initialPoint);
}

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));