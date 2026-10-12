"use strict";

function ProcessInput(inputString) {
  const rawDataLines = inputString.split('\n');
  // The first line contains 'n', which is not directly used in the subsequent logic.
  const robotDescriptions = rawDataLines.slice(1);

  const calculatedIntervals = robotDescriptions.map(descriptionText => {
    const numericComponents = descriptionText.split(' ').map(Number);
    const centerPosition = numericComponents[0];
    const reachDistance = numericComponents[1];
    // Transform [x, d] into [x-d, x+d] representing [start_point, end_point]
    return [centerPosition - reachDistance, centerPosition + reachDistance];
  });

  // Sort the intervals primarily by their end points in ascending order.
  calculatedIntervals.sort((firstInterval, secondInterval) => firstInterval[1] - secondInterval[1]);

  const schedulingResult = calculatedIntervals.reduce((currentStatus, currentSegment) => {
    const [segmentStartPoint, segmentEndPoint] = currentSegment;

    // If the current segment's start point is greater than or equal to the end point
    // of the last successfully chosen segment, it can be selected without overlap.
    if (segmentStartPoint >= currentStatus.lastChosenEnd) {
      return {
        selectedCount: currentStatus.selectedCount + 1,
        lastChosenEnd: segmentEndPoint
      };
    }
    // Otherwise, the segment overlaps, so we don't select it and the status remains unchanged.
    return currentStatus;
  }, { selectedCount: 0, lastChosenEnd: -1e10 }); // Initialize lastChosenEnd to a very small number, matching original logic.

  console.log(schedulingResult.selectedCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
