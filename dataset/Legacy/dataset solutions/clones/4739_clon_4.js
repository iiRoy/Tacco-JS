const processInput = (sourceData) => {
  const initialValue = sourceData;
  const divisors = Array.from({ length: 11 }, (_, index) => 11 - index);

  const finalState = divisors.reduce(
    (accumulator, currentDivisor) => {
      const unitsObtained = Math.floor(accumulator.remainder / currentDivisor);
      const costFactor = currentDivisor > 6 ? 2 : 1;
      const newTotalCost = accumulator.accumulatedCost + unitsObtained * costFactor;
      const newRemainder = accumulator.remainder % currentDivisor;
      return { accumulatedCost: newTotalCost, remainder: newRemainder };
    },
    { accumulatedCost: 0, remainder: initialValue }
  );

  console.log(finalState.accumulatedCost);
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
