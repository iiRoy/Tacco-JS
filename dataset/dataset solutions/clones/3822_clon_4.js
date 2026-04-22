(function calculationUnit() {
  const obtainStream = () => readline();

  const processSequence = (inputDatum) => {
    const stringSegments = inputDatum.split(" ");
    const numericalElements = stringSegments.slice(0, 2).map(val => Number(val));
    const finalAggregation = numericalElements.reduce((summation, currentTerm) => summation + currentTerm, 0);
    return finalAggregation;
  };

  const rawEntry = obtainStream();
  const computedOutcome = processSequence(rawEntry);
  print(computedOutcome);
})();