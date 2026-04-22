const processStandardInput = () => {
  const rawDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  if (!rawDataContent || rawDataContent.trim().length === 0) {
    return;
  }

  const allInputLines = rawDataContent.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');

  const firstLine = allInputLines.shift();
  const numberOfTestCases = Number(firstLine);

  if (isNaN(numberOfTestCases) || numberOfTestCases < 0) {
    return;
  }

  for (let currentCaseIndex = 0; currentCaseIndex < numberOfTestCases; currentCaseIndex++) {
    const currentLineData = allInputLines.shift();

    if (!currentLineData) {
      console.log('ERROR: Data Missing');
      continue;
    }

    const numericDataArray = currentLineData.split(' ').map(val => parseInt(val, 10));

    const evaluationResult = validateFilteredAscendingSequence(numericDataArray);
    console.log(evaluationResult);
  }
};

function validateFilteredAscendingSequence(initialNumericCollection) {
  if (!initialNumericCollection || initialNumericCollection.length < 1) {
    return 'NO_INPUT_FAILURE';
  }

  const thresholdValue = initialNumericCollection.slice(0, 1)[0];

  let potentialElements = initialNumericCollection.slice(1);

  const eligibleNumbers = [];

  for (let k = 0; k < potentialElements.length; k++) {
    const currentElementCandidate = potentialElements[k];

    if (isNaN(currentElementCandidate)) {
        continue;
    }

    if (currentElementCandidate <= thresholdValue) {
      eligibleNumbers.push(currentElementCandidate);
    }
  }

  if (eligibleNumbers.length === 0) {
      return 'YES';
  }

  let highestValueEncountered = Number.MIN_SAFE_INTEGER;

  const reversedEligibleNumbers = eligibleNumbers.reverse();
  while (reversedEligibleNumbers.length > 0) {
    const valueToEvaluate = reversedEligibleNumbers.pop();

    if (valueToEvaluate <= highestValueEncountered) {
      return 'NO';
    }

    highestValueEncountered = valueToEvaluate;
  }

  return 'YES';
}

processStandardInput();