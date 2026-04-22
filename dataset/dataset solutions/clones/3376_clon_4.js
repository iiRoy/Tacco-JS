const solveProblem = (rawDataInput) => {
  const inputRows = rawDataInput.split('\n');
  const firstNumericLine = inputRows[0];
  const numericComponents = firstNumericLine.split(' ');
  const factorCount = Number(numericComponents[0]);
  const targetProduct = Number(numericComponents[1]);

  if (factorCount === 1) {
    console.log(targetProduct);
    return;
  }

  const calculationCeiling = Math.floor(Math.pow(targetProduct, 1 / factorCount));

  const candidateBaseValues = Array.from({ length: Math.max(0, calculationCeiling - 1) }, (_, index) => index + 2);

  const finalComputedValue = candidateBaseValues.reduce((currentMax, currentCandidate) => {
    if (targetProduct % Math.pow(currentCandidate, factorCount) === 0) {
      return currentCandidate;
    }
    return currentMax;
  }, 1);

  console.log(finalComputedValue);
};

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));