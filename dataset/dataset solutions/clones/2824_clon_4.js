function computeResult(dataSource) {
  const textLines = dataSource.split('\n');

  const parameterLine = textLines[0];
  const dataPointLine = textLines[1];

  const parsedParameters = parameterLine.split(' ').map(Number);

  const maxConsiderationCount = parsedParameters[0];
  const thresholdValue = parsedParameters[1];

  const numericalSequence = dataPointLine.split(' ').map(Number);

  const effectiveIterationLimit = maxConsiderationCount + 1;

  let currentAccumulatedValue = 0;
  const derivedCumulativeSums = Array.from({ length: effectiveIterationLimit }, (_, idx) => {
    if (idx < numericalSequence.length) {
      currentAccumulatedValue += numericalSequence[idx];
    }
    return currentAccumulatedValue;
  });

  const matchingPosition = derivedCumulativeSums.findIndex(sum => sum >= thresholdValue);

  let finalReportedValue;
  if (matchingPosition !== -1) {
    finalReportedValue = matchingPosition + 1;
  } else {
    finalReportedValue = maxConsiderationCount;
  }

  console.log(finalReportedValue);
}

computeResult(require('fs').readFileSync('/dev/stdin', 'utf8'));