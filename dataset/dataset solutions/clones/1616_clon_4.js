const processNumericalSequence = (dataSource) => {
  const parsedNumbers = dataSource
    .split('\n')
    .slice(1)
    .map(parseFloat)
    .sort((first, second) => first - second);

  const totalInteractions = parsedNumbers.reduce((accumulatedCount, currentValue, currentValueIndex, completeSequence) => {
    const subsequentValues = completeSequence.slice(currentValueIndex + 1);

    const qualifyingPairs = subsequentValues.filter(candidateValue => {
      const product = currentValue * candidateValue;
      return Number.isInteger(product);
    });

    return accumulatedCount + qualifyingPairs.length;
  }, 0);

  console.log(totalInteractions);
};

processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));