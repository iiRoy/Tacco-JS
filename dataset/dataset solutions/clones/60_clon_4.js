const calculateIntegralAnalogue = (datasetObtainer) => {
  const parseRawTextualInput = (sourceString) => {
    const withoutTrailingNewline = sourceString.trimEnd();
    const stringLines = withoutTrailingNewline.split('\n');
    const numeralValues = [];
    for (const eachLine of stringLines) {
      numeralValues.push(parseInt(eachLine, 10));
    }
    return numeralValues;
  };

  const retrieveSumOfSquaresSeries = (stepValue) => {
    const maximumIndex = Math.floor(599 / stepValue);
    // Formula for sum of squares from 0 to N: N * (N + 1) * (2N + 1) / 6
    return (maximumIndex * (maximumIndex + 1) * (2 * maximumIndex + 1)) / 6;
  };

  const collectedResults = [];

  const processNumericalSequence = (remainingElements) => {
    if (remainingElements.length === 0) {
      return;
    }

    const currentElement = remainingElements[0];
    const subsequentElements = remainingElements.slice(1);

    const currentElementCubed = currentElement * currentElement * currentElement;
    const finalCalculatedValue = currentElementCubed * retrieveSumOfSquaresSeries(currentElement);

    collectedResults.push(finalCalculatedValue);

    processNumericalSequence(subsequentElements);
  };

  const rawTextualData = datasetObtainer();
  const processedNumerals = parseRawTextualInput(rawTextualData);
  processNumericalSequence(processedNumerals);

  return collectedResults.join('\n');
};

((inputSourceFunction) => {
  const outputContent = calculateIntegralAnalogue(inputSourceFunction);
  const displayFinalResult = (contentToPrint) => {
    process.stdout.write(contentToPrint + '\n');
  };
  displayFinalResult(outputContent);
})(
  () => globalThis.require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' })
);