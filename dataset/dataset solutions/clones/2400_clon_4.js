function analyzeSeries(sourceText) {
  const dataLines = sourceText.trim().split('\n');

  const parameters = dataLines[0].split(' ').map(parseFloat); 
  const modulus = parameters[1];
  
  const numericalElements = dataLines[1].split(' ').map(parseFloat);

  const runningTotals = numericalElements.reduce((accumulator, currentItem) => {
    accumulator.push((accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0) + currentItem);
    return accumulator;
  }, [0]);

  const subarrayProperties = numericalElements.flatMap((_, startIndex) => {
    return numericalElements.slice(startIndex).map((_, subLengthOffset) => {
      const endIndex = startIndex + subLengthOffset;
      const currentSum = runningTotals[endIndex + 1] - runningTotals[startIndex];
      const currentLength = endIndex - startIndex + 1;
      return { currentSum, currentLength };
    });
  });

  const finalCount = subarrayProperties.filter(props => 
    (props.currentSum % modulus) === props.currentLength
  ).length;
  
  console.log(finalCount);
}

analyzeSeries(require('fs').readFileSync('/dev/stdin', 'utf8'));