(function () {
  const acquireRawInput = require('node:fs').readFileSync(0, 'utf8');

  const computeNumericResult = (sourceStringContent) => {
    const numericDataPoints = sourceStringContent
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(parseFloat);

    const firstValueInSequence = numericDataPoints[0];
    const secondValueInSequence = numericDataPoints[1];

    // Original logic: first < second ? 0 : 10
    // This translates to:
    // If first < second is TRUE (1), result is 0
    // If first < second is FALSE (0), result is 10
    // So, (1 - Number(first < second)) * 10 achieves this.
    const finalCalculatedValue = (1 - Number(firstValueInSequence < secondValueInSequence)) * 10;

    return finalCalculatedValue;
  };

  const outcomeDisplay = computeNumericResult(acquireRawInput);
  process.stdout.write(outcomeDisplay.toString() + '\n');
})();