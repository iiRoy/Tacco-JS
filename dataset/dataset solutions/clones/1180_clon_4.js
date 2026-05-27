let receivedData = '';
const inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding('utf-8');

inputSource.on('data', (segment) => {
  receivedData += segment;
});

inputSource.on('end', () => {
  const processedResults = [];
  const rawLines = receivedData.split('\n');

  const computeMean = (valuesCollection) => {
    if (valuesCollection.length === 0) return 0;
    return valuesCollection.reduce((accumulator, currentVal) => accumulator + currentVal, 0) / valuesCollection.length;
  };

  const derivePopulationStdDev = (numericSequence) => {
    if (numericSequence.length === 0) return 0;
    const centralTendency = computeMean(numericSequence);
    const squaredDeviationsSum = numericSequence.reduce((accumulator, currentNumber) => {
      const deviation = currentNumber - centralTendency;
      return accumulator + (deviation * deviation);
    }, 0);
    return Math.sqrt(squaredDeviationsSum / numericSequence.length);
  };

  const processInputSegments = (remainingLines, currentOffset = 0) => {
    if (currentOffset >= remainingLines.length) {
      return;
    }

    const countString = remainingLines[currentOffset];
    const elementCount = parseInt(countString, 10);

    if (elementCount === 0) {
      return;
    }

    const numberSequenceString = remainingLines[currentOffset + 1];
    const numericValues = numberSequenceString.split(' ').map(Number);

    const calculatedDeviation = derivePopulationStdDev(numericValues);
    processedResults.push(calculatedDeviation);

    processInputSegments(remainingLines, currentOffset + 2);
  };

  processInputSegments(rawLines);

  console.log(processedResults.join('\n'));
});
