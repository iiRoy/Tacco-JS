'use strict';
const displayOutcome = (phrase) => console.log(phrase);

function processData(rawDataLines) {
  const firstSegmentInfo = rawDataLines[0].split(" ");
  const divisorVal = Number(firstSegmentInfo[0]);

  const secondSegmentInfo = rawDataLines[1].split(" ");
  const lowerBoundary = Number(secondSegmentInfo[0]);
  const upperBoundary = Number(secondSegmentInfo[1]);

  const floorQuotient = Math.floor((lowerBoundary - 1) / divisorVal);
  const firstMatchingMultiple = (floorQuotient + 1) * divisorVal;

  if (firstMatchingMultiple <= upperBoundary) {
    displayOutcome('OK');
  } else {
    displayOutcome('NO');
  }
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));