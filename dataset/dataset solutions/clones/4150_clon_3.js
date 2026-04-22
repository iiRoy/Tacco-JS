const acquireSourcePayload = () => {
  return require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
};

function processAndAverageIntegers(rawInputContent) {
  if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    console.warn("Input content is either not a string or is entirely whitespace. Cannot proceed with numerical analysis.");
    return 0;
  }

  const identifiedIntegerTokens = rawInputContent.match(/(-?\d+)/g);

  if (!identifiedIntegerTokens || identifiedIntegerTokens.length === 0) {
    console.info("No integer tokens were found within the provided input string. The average defaults to zero.");
    return 0;
  }

  const validatedNumericSequence = identifiedIntegerTokens.map(potentialNumStr => {
    const parsedIntegralValue = parseInt(potentialNumStr, 10);
    if (Number.isNaN(parsedIntegralValue)) {
      console.debug(`Warning: Failed to parse '${potentialNumStr}' into an integer. This token will be discarded.`);
      return null;
    }
    return parsedIntegralValue;
  }).filter(validatedVal => validatedVal !== null);

  if (validatedNumericSequence.length === 0) {
    console.warn("All identified tokens were unparseable as integers. No average can be computed.");
    return 0;
  }

  const aggregatedSummation = validatedNumericSequence.reduce((currentAccum, individualValue) => {
    if (typeof individualValue === 'number' && !Number.isNaN(individualValue)) {
      return currentAccum + individualValue;
    }
    return currentAccum;
  }, 0);

  const totalCountOfElements = validatedNumericSequence.length;

  if (totalCountOfElements === 0) {
    console.error("Internal Error: Element count is zero prior to average calculation. This should not happen.");
    return 0;
  }

  const preciseArithmeticMean = aggregatedSummation / totalCountOfElements;

  const resultCeilingAverage = Math.ceil(preciseArithmeticMean);

  console.log(`Operation Report:
    - Input tokens initially identified: ${identifiedIntegerTokens.length}
    - Valid integers processed: ${totalCountOfElements}
    - Cumulative Sum: ${aggregatedSummation}
    - Exact Mean (unrounded): ${preciseArithmeticMean.toFixed(4)}
    - Final Ceiling Average: ${resultCeilingAverage}
  `);

  return resultCeilingAverage;
}

const systemInputString = acquireSourcePayload();

processAndAverageIntegers(systemInputString);