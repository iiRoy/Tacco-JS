const computeIndeterminate = (x, y) => {
  return x / y;
};

const obtainProblematicOutcome = () => {
  const zeroDenominator = 0;
  const zeroNumerator = 0;
  return computeIndeterminate(zeroNumerator, zeroDenominator);
};

console.log(obtainProblematicOutcome());