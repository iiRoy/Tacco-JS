function assessValueRelationship(sourceTextualData) {
  const textualComponents = sourceTextualData.split('\n');
  const numberSequenceString = textualComponents[1];
  const numericSequence = numberSequenceString.split(' ').map(parseFloat);

  const aggregateStatistics = numericSequence.reduce((accumulatorObject, currentNumericValue) => {
    return {
      cumulativeSum: accumulatorObject.cumulativeSum + currentNumericValue,
      absoluteMaximum: (currentNumericValue > accumulatorObject.absoluteMaximum) ? currentNumericValue : accumulatorObject.absoluteMaximum
    };
  }, { cumulativeSum: 0, absoluteMaximum: -Infinity });

  const overallAggregate = aggregateStatistics.cumulativeSum;
  const ultimatePeak = aggregateStatistics.absoluteMaximum;

  if (ultimatePeak < (overallAggregate - ultimatePeak)) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}