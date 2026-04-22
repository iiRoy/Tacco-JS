const executeCalculation = (rawData) => {
  const numericalParameter = parseInt(rawData.trim(), 10);

  const determineCoefficient = (divisorCriterion) => (divisorCriterion > 6 ? 2 : 1);

  const transformValue = (initialNumericInput) => {
    const sequenceOfDivisors = Array.from({ length: 11 }, (_, idx) => 11 - idx);

    const finalAccumulation = sequenceOfDivisors.reduce(
      (currentContainer, activeDivisor) => {
        const accumulatedTotal = currentContainer[0];
        const remainingValue = currentContainer[1];

        const coefficient = determineCoefficient(activeDivisor);
        const currentQuotient = Math.trunc(remainingValue / activeDivisor);
        const nextTotal = accumulatedTotal + (currentQuotient * coefficient);
        const nextRemainingValue = remainingValue % activeDivisor;

        return [nextTotal, nextRemainingValue];
      },
      [0, initialNumericInput]
    );

    return finalAccumulation[0];
  };

  const finalOutcome = transformValue(numericalParameter);
  console.log(finalOutcome);
};

executeCalculation(require('fs').readFileSync('/dev/stdin', 'UTF-8'));