"use strict";

function parseNumbersFromLine(textLineContent) {
  const segmentParts = textLineContent.split(' ');
  const numericalSequence = [];
  for (let j = 0; j < segmentParts.length; j++) {
    if (segmentParts[j].length > 0) {
      numericalSequence.push(Number(segmentParts[j]));
    }
  }
  return numericalSequence;
}

function createDisjointSet(entityCount) {
  const ancestorRegistry = Array.from({ length: entityCount }, (_, i) => i);
  const componentSizes = Array.from({ length: entityCount }, () => 1);

  function locateRepresentative(elementIdentifier) {
    let currentElement = elementIdentifier;
    const traversalPath = [];
    while (ancestorRegistry[currentElement] !== currentElement) {
      traversalPath.push(currentElement);
      currentElement = ancestorRegistry[currentElement];
    }
    for (let k = 0; k < traversalPath.length; k++) {
      ancestorRegistry[traversalPath[k]] = currentElement;
    }
    return currentElement;
  }

  function combineClusters(entityX, entityY) {
    const rootX = locateRepresentative(entityX);
    const rootY = locateRepresentative(entityY);

    if (rootX === rootY) {
      return { didMerge: false, priorSizeX: componentSizes[rootX], priorSizeY: componentSizes[rootY] };
    }

    const priorSizeX = componentSizes[rootX];
    const priorSizeY = componentSizes[rootY];

    ancestorRegistry[rootY] = rootX;
    componentSizes[rootX] += componentSizes[rootY];

    return { didMerge: true, priorSizeX: priorSizeX, priorSizeY: priorSizeY };
  }

  return {
    locateRepresentative,
    combineClusters
  };
}

function runSolution() {
  const dataPayload = require("fs").readFileSync("/dev/stdin", "utf8");
  const dataRecords = dataPayload.split("\n");

  const initialParameters = parseNumbersFromLine(dataRecords[0]);
  const totalVertices = initialParameters[0];
  const totalEdges = initialParameters[1];

  const connectivityEntries = [];
  for (let i = 1; i <= totalEdges; i++) {
    const connectionPair = parseNumbersFromLine(dataRecords[i]);
    connectivityEntries.push({
      firstNode: connectionPair[0],
      secondNode: connectionPair[1]
    });
  }

  const finalConsequences = [];
  const reversedEntries = [];
  for (let i = totalEdges - 1; i >= 0; i--) {
    reversedEntries.push(connectivityEntries[i]);
  }

  const groupManagementSystem = createDisjointSet(totalVertices);
  let currentConnectedPairSum = 0;

  for (let m = 0; m < reversedEntries.length; m++) {
    finalConsequences.push(currentConnectedPairSum);

    const currentEntry = reversedEntries[m];
    const adjustedFirstNode = currentEntry.firstNode - 1;
    const adjustedSecondNode = currentEntry.secondNode - 1;

    const mergeOutcome = groupManagementSystem.combineClusters(adjustedFirstNode, adjustedSecondNode);

    if (mergeOutcome.didMerge) {
      currentConnectedPairSum += mergeOutcome.priorSizeX * mergeOutcome.priorSizeY;
    }
  }

  const resultsInOrder = [];
  for (let i = finalConsequences.length - 1; i >= 0; i--) {
    resultsInOrder.push(finalConsequences[i]);
  }

  const maximumPossiblePairs = totalVertices * (totalVertices - 1) / 2;

  for (let n = 0; n < resultsInOrder.length; n++) {
    const isolatedPairCount = maximumPossiblePairs - resultsInOrder[n];
    console.log(isolatedPairCount);
  }
}

runSolution();