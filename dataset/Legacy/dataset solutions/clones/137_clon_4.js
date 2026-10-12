(function(sourceData) {
  const processedLines = sourceData.replace(/\n$/, '').split('\n');

  processedLines.forEach(currentLineEntry => {
    const numericSegments = currentLineEntry.split(',').map(Number);

    const weightTwo = numericSegments.pop();
    const weightOne = numericSegments.pop();

    console.log(locateThreshold(numericSegments, weightOne, weightTwo));
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

const locateThreshold = (segmentValues, firstFactor, secondFactor) => {
  if (segmentValues.length === 0) {
    return 1;
  }

  let runningSum = 0;
  const cumulativeTotals = segmentValues.map(val => runningSum += val);

  const totalSum = cumulativeTotals[cumulativeTotals.length - 1];

  const targetValue = totalSum * firstFactor / (firstFactor + secondFactor);

  const foundIndex = cumulativeTotals.findIndex(sum => targetValue <= sum);

  return foundIndex === -1 ? undefined : foundIndex + 1;
};
