function processInput(sourceText) {
  const lineSegments = sourceText.split('\n');
  const numericTokens = lineSegments[1].split(' ');

  const aggregateData = numericTokens.reduce((accumulator, currentToken) => {
    const numericValue = Number(currentToken);
    accumulator.total += numericValue;
    accumulator.highest = Math.max(accumulator.highest, numericValue);
    return accumulator;
  }, { total: 0, highest: -Infinity });

  const { total, highest } = aggregateData;

  const comparisonResult = (2 * highest < total) ? "Yes" : "No";
  console.log(comparisonResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
