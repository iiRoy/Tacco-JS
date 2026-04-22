const obtainNumericalArray = (textLine) => textLine.split(' ').map((itemString) => parseInt(itemString, 10));

const calculateNetBenefit = (sourceData) => {
  const dataSegments = sourceData.split('\n');

  const iterationCount = parseInt(dataSegments[0], 10);

  if (isNaN(iterationCount) || iterationCount <= 0) {
      console.log(0);
      return;
  }

  const valueStream = obtainNumericalArray(dataSegments[1]);
  const costStream = obtainNumericalArray(dataSegments[2]);

  const cumulativeAdvantage = Array.from({ length: iterationCount })
    .map((_, elementIndex) => {
      const difference = valueStream[elementIndex] - costStream[elementIndex];
      return isNaN(difference) ? 0 : difference;
    })
    .map(processedDifference => Math.max(0, processedDifference))
    .reduce((currentTotal, positiveDifference) => currentTotal + positiveDifference, 0);

  console.log(cumulativeAdvantage);
};

calculateNetBenefit(require('fs').readFileSync('/dev/stdin', 'utf8'));