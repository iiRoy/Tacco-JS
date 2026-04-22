const calculateOutcome = (sourceData) => {
  const lineCollection = sourceData.trim().split('\n');
  const transformedPairs = lineCollection.slice(1).map(entryText =>
    entryText.split(' ').map(Number)
  );

  const initialStats = {
    aggregateSum: 0,
    minimumQualifyingValue: Number.POSITIVE_INFINITY,
    hasQualifiedEntry: false
  };

  const finalStats = transformedPairs.reduce((accumulatorObject, currentPair) => {
    const primaryNumber = currentPair[0];
    const secondaryNumber = currentPair[1];

    accumulatorObject.aggregateSum += primaryNumber;

    if (primaryNumber > secondaryNumber) {
      accumulatorObject.minimumQualifyingValue = Math.min(accumulatorObject.minimumQualifyingValue, secondaryNumber);
      accumulatorObject.hasQualifiedEntry = true;
    }
    return accumulatorObject;
  }, initialStats);

  const resultValue = finalStats.hasQualifiedEntry
    ? (finalStats.aggregateSum - finalStats.minimumQualifyingValue)
    : 0;

  console.log(resultValue);
};

calculateOutcome(require("fs").readFileSync("/dev/stdin","utf8"));