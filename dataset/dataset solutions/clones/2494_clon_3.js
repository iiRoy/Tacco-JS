'use strict';

function updateDistinctState(currentElementValue, previousElementValue, currentCountValue) {
  if (previousElementValue !== currentElementValue) {
    return {
      updatedCount: currentCountValue + 1,
      updatedPreviousElement: currentElementValue
    };
  }
  return {
    updatedCount: currentCountValue,
    updatedPreviousElement: previousElementValue
  };
}

function processInput(rawData) {
  const NEWLINE_DELIMITER = '\n';
  const SPACE_DELIMITER = ' ';

  const inputLines = rawData.split(NEWLINE_DELIMITER);

  const numElements = parseInt(inputLines[0], 10);

  const elementStrings = inputLines[1].split(SPACE_DELIMITER);

  let distinctCount = 0;
  let lastSeenElement = '';

  for (let elementIndex = 0; elementIndex < numElements; ++elementIndex) {
    const currentElement = elementStrings[elementIndex];

    const stateUpdateResult = updateDistinctState(currentElement, lastSeenElement, distinctCount);
    distinctCount = stateUpdateResult.updatedCount;
    lastSeenElement = stateUpdateResult.updatedPreviousElement;
  }

  console.log(distinctCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
