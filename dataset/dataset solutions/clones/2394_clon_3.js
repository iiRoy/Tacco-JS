function processInputData(rawData) {
  const numEdgesToProcess = parseInt(rawData[0], 10);

  const assignedColorsByNode = {};
  let highestColorUsed = 0;
  const edgeColorsResult = [];

  const ensureNodeColorArray = (nodeMap, nodeId) => {
    if (!nodeMap[nodeId]) {
      nodeMap[nodeId] = [];
    }
    return nodeMap[nodeId];
  };

  const determineSmallestAvailableColor = (conflictingColorsSet, currentMax) => {
    let chosenColor = currentMax + 1;
    for (let potentialColor = 1; potentialColor <= currentMax; potentialColor++) {
      if (!conflictingColorsSet[potentialColor]) {
        chosenColor = potentialColor;
        break;
      }
    }
    return chosenColor;
  };

  for (let edgeIndex = 1; edgeIndex < numEdgesToProcess; edgeIndex++) {
    const edgeParts = rawData[edgeIndex].split(" ");
    const nodeA = parseInt(edgeParts[0], 10);
    const nodeB = parseInt(edgeParts[1], 10);

    const colorsForNodeA = ensureNodeColorArray(assignedColorsByNode, nodeA);
    const colorsForNodeB = ensureNodeColorArray(assignedColorsByNode, nodeB);

    const allConflictingColors = colorsForNodeA.concat(colorsForNodeB);

    let currentEdgeColor;

    if (allConflictingColors.length === 0) {
      const initialColor = 1;
      colorsForNodeA.push(initialColor);
      colorsForNodeB.push(initialColor);
      currentEdgeColor = initialColor;
      highestColorUsed = initialColor;
    } else {
      const unavailableColorsSet = {};
      allConflictingColors.forEach(colorValue => {
        unavailableColorsSet[colorValue] = true;
      });

      currentEdgeColor = determineSmallestAvailableColor(unavailableColorsSet, highestColorUsed);

      colorsForNodeA.push(currentEdgeColor);
      colorsForNodeB.push(currentEdgeColor);

      highestColorUsed = Math.max(highestColorUsed, currentEdgeColor);
    }
    edgeColorsResult.push(currentEdgeColor);
  }

  console.log(highestColorUsed);
  edgeColorsResult.forEach(colorValue => {
    console.log(colorValue);
  });
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
