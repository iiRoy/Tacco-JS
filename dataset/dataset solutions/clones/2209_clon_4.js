function processInput(inputData) {
  const firstDelimiterPosition = inputData.indexOf(' ');
  let initialSegment, subsequentSegment;

  if (firstDelimiterPosition === -1) {
    initialSegment = inputData;
    subsequentSegment = undefined;
  } else {
    initialSegment = inputData.substring(0, firstDelimiterPosition);
    const nextDelimiterPosition = inputData.indexOf(' ', firstDelimiterPosition + 1);
    if (nextDelimiterPosition === -1) {
      subsequentSegment = inputData.substring(firstDelimiterPosition + 1);
    } else {
      subsequentSegment = inputData.substring(firstDelimiterPosition + 1, nextDelimiterPosition);
    }
  }

  console.log((initialSegment === subsequentSegment) ? 'Yes' : 'No');
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
