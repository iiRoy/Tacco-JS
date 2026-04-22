function processData(rawData) {
  const initialValue = Number.parseInt(rawData, 10);

  if (initialValue < 2) {
    return;
  }

  function findMaximalSquare(currentMultiplier, upperBoundary) {
    const calculatedProduct = currentMultiplier * currentMultiplier;

    if (calculatedProduct > upperBoundary) {
      const priorMultiplier = currentMultiplier - 1;
      return priorMultiplier * priorMultiplier;
    } else {
      return findMaximalSquare(currentMultiplier + 1, upperBoundary);
    }
  }

  const resultantSquare = findMaximalSquare(1, initialValue);

  if (resultantSquare > 1) {
    console.info(resultantSquare);
  }
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));