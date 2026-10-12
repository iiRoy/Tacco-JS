function ProcessInput(rawDataLines) {
  const pointCount = Number(rawDataLines[0]);
  const intermediatePoints = rawDataLines[1].split(/\s+/).map(Number);

  // Construct the complete sequence of points, including the implicit start (0) and end (0).
  // Example: [0, P1, P2, ..., Pn, 0]
  const fullPathNodes = [0, ...intermediatePoints, 0];

  // Calculate the total path length for each scenario where one intermediate point is removed.
  const pathLengthsAfterRemoval = Array.from({
    length: pointCount
  }, (_, removalIdx) => {
    // Determine which point to exclude from the full path.
    // removalIdx corresponds to the 0-indexed position in intermediatePoints,
    // which is fullPathNodes[removalIdx + 1].
    const pathSegmentsWithoutNode = [
      ...fullPathNodes.slice(0, removalIdx + 1), // Includes the starting 0 and points before the removed one
      ...fullPathNodes.slice(removalIdx + 2), // Includes points after the removed one and the ending 0
    ];

    // Calculate the total distance for this modified path.
    // This is done by summing the absolute differences between consecutive points.
    const currentTotalDistance = pathSegmentsWithoutNode.slice(1).reduce((accumulatedDistance, currentNodeValue, segmentIndex) => {
      const previousNodeValue = pathSegmentsWithoutNode[segmentIndex]; // segmentIndex is 0-based for slice(1)
      return accumulatedDistance + Math.abs(currentNodeValue - previousNodeValue);
    }, 0);

    return currentTotalDistance;
  });

  // Output each calculated path length.
  pathLengthsAfterRemoval.forEach((lengthValue) => console.log(lengthValue));
}

// Standard input processing for competitive programming environments.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
