function processData(rawData) {
  const lines = rawData.split('\n');
  const firstLineTokens = lines[0].split(' ');
  const elementCount = Number(firstLineTokens[0]);

  const numericValues = lines[1].split(' ').slice(0, elementCount).map(Number);

  const finalState = numericValues.reduce((accumulator, currentValue) => {
    const { currentMinimum, maximumDifference, differenceCount } = accumulator;

    const effectiveMinimum = Math.min(currentMinimum, currentValue);
    const calculatedDifference = currentValue - effectiveMinimum;

    let newMaximumDifference = maximumDifference;
    let newDifferenceCount = differenceCount;

    if (calculatedDifference > maximumDifference) {
      newMaximumDifference = calculatedDifference;
      newDifferenceCount = 1;
    } else if (calculatedDifference === maximumDifference) {
      newDifferenceCount++;
    }

    return {
      currentMinimum: effectiveMinimum,
      maximumDifference: newMaximumDifference,
      differenceCount: newDifferenceCount
    };
  }, { currentMinimum: Infinity, maximumDifference: 0, differenceCount: 0 });

  console.log('%s', finalState.differenceCount);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
