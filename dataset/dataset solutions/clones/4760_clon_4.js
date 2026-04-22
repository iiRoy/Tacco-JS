'use strict';

function processSequenceAndOutputMaximumElevation(rawDataInput) {
  const quantityOfOperations = Number.parseInt(rawDataInput.slice(0, 1), 10);
  const directiveStream = rawDataInput.slice(1, 1 + quantityOfOperations);

  const culminatingMetrics = directiveStream.split('').reduce((traversalState, commandUnit, indexInStream) => {
    const elevationDelta = (commandUnit === 'I') ? 1 : -1;
    const presentElevation = traversalState.currentPoint + elevationDelta;

    const maximumElevationAttained = (indexInStream === 0)
      ? presentElevation
      : Math.max(traversalState.absoluteApex, presentElevation);

    return {
      currentPoint: presentElevation,
      absoluteApex: maximumElevationAttained
    };
  }, { currentPoint: 0, absoluteApex: 0 });

  console.log(culminatingMetrics.absoluteApex);
}

processSequenceAndOutputMaximumElevation(require("fs").readFileSync("/dev/stdin", "utf8"));