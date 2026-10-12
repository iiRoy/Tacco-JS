const determineUpperInteger = (dividendValue, divisorValue) => {
  if (divisorValue === 0) {
    if (dividendValue === 0) return NaN;
    return dividendValue > 0 ? Infinity : -Infinity;
  }
  if (isNaN(dividendValue) || isNaN(divisorValue)) return NaN;

  const quotient = dividendValue / divisorValue;
  const integerPart = Math.trunc(quotient);

  if (quotient > 0 && quotient !== integerPart) {
    return integerPart + 1;
  }
  return integerPart;
};

const extractNumericSequence = (rawInputText) => {
  return rawInputText.split(' ').reduce((accumulatorArray, currentStringPart) => {
    accumulatorArray.push(parseInt(currentStringPart, 10));
    return accumulatorArray;
  }, []);
};

const performComparisonTask = (sourceInput) => {
  const numericalComponents = extractNumericSequence(sourceInput);

  const componentA = numericalComponents[0];
  const componentB = numericalComponents[1];
  const componentC = numericalComponents[2];
  const componentD = numericalComponents[3];

  const firstResultant = determineUpperInteger(componentC, componentB);
  const secondResultant = determineUpperInteger(componentA, componentD);

  const finalVerdict = (firstResultant === secondResultant) ? 'Yes' : 'No';
  console.log(finalVerdict);
};

performComparisonTask(require('fs').readFileSync('/dev/stdin', 'utf8'));
