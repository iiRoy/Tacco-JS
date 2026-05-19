'use strict'

function processPathModifications(inputContent) {
  const numericValues = inputContent.split('\n')[1].split(' ').map(Number);

  const pathSegments = [0, ...numericValues, 0];

  const initialTotalDistance = pathSegments.reduce((accumulator, currentSegment, segmentIndex, fullPath) => {
    if (segmentIndex === 0) {
      return accumulator;
    }
    return accumulator + Math.abs(currentSegment - fullPath[segmentIndex - 1]);
  }, 0);

  const modifiedDistances = numericValues.map((_, originalIndex) => {
    const pointBeforeSkipped = pathSegments[originalIndex];
    const pointToSkip = pathSegments[originalIndex + 1];
    const pointAfterSkipped = pathSegments[originalIndex + 2];

    const directPathLength = Math.abs(pointBeforeSkipped - pointAfterSkipped);

    const sequentialPathLength = Math.abs(pointBeforeSkipped - pointToSkip) + Math.abs(pointToSkip - pointAfterSkipped);

    const distanceChange = directPathLength - sequentialPathLength;

    return initialTotalDistance + distanceChange;
  });

  console.log(modifiedDistances.join('\n'));
}

processPathModifications(require("fs").readFileSync("/dev/stdin", "utf8"));
