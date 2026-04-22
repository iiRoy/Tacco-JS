const processNumericTransformation = (valueToModify, accompanyingValue) => {
  let alteredValue = valueToModify;
  if (alteredValue % 2 !== 0) {
    alteredValue--;
  }
  alteredValue /= 2;
  const updatedAccompanyingValue = accompanyingValue + alteredValue;
  return [alteredValue, updatedAccompanyingValue];
};

const iterateThroughSteps = (currentCycle, cycleLimit, primaryDatum, secondaryDatum) => {
  if (currentCycle > cycleLimit) {
    return [primaryDatum, secondaryDatum];
  }

  let nextPrimary, nextSecondary;
  if (currentCycle % 2 !== 0) {
    const [transformedPrimary, updatedSecondary] = processNumericTransformation(primaryDatum, secondaryDatum);
    nextPrimary = transformedPrimary;
    nextSecondary = updatedSecondary;
  } else {
    const [transformedSecondary, updatedPrimary] = processNumericTransformation(secondaryDatum, primaryDatum);
    nextPrimary = updatedPrimary;
    nextSecondary = transformedSecondary;
  }

  return iterateThroughSteps(currentCycle + 1, cycleLimit, nextPrimary, nextSecondary);
};

const initiateComputation = (rawInputContent) => {
  const parsedNumbers = rawInputContent.split('\n')[0].split(/\s/).map(Number);
  const startValueA = parsedNumbers[0];
  const startValueB = parsedNumbers[1];
  const totalIterations = parsedNumbers[2];

  const finalResults = iterateThroughSteps(1, totalIterations, startValueA, startValueB);

  console.log(`${finalResults[0]} ${finalResults[1]}`);
};

initiateComputation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));