"use strict";

function createInputParser(rawContent, defaultConverter = Number) {
  const contentLines = rawContent.split("\n");
  let currentLinePosition = 0;
  let currentTokenPosition = 0;

  const retrieveNextToken = (customConverter = defaultConverter) => {
    while (currentLinePosition < contentLines.length) {
      const activeLine = contentLines[currentLinePosition];
      if (!activeLine || activeLine.trim().length === 0) {
        currentLinePosition++;
        currentTokenPosition = 0;
        continue;
      }

      const lineTokens = activeLine.trim().split(" ");
      if (currentTokenPosition < lineTokens.length) {
        const tokenValue = lineTokens[currentTokenPosition];
        currentTokenPosition++;
        return customConverter(tokenValue);
      } else {
        currentLinePosition++;
        currentTokenPosition = 0;
      }
    }
    return undefined;
  };

  const retrieveLineTokens = (customConverter = defaultConverter) => {
    if (currentLinePosition >= contentLines.length) return undefined;

    const activeLine = contentLines[currentLinePosition];
    currentLinePosition++;
    currentTokenPosition = 0;

    if (!activeLine || activeLine.trim().length === 0) return [];

    return activeLine.trim().split(" ").map(customConverter);
  };

  return {
    fetchNextValue: retrieveNextToken,
    fetchLineValues: retrieveLineTokens
  };
}

function removeNodesAndConnections(initialGraphState, nodesToExcludeSet) {
  const resultingGraphState = new Map();

  for (const [nodeIdentifier, neighborSet] of initialGraphState.entries()) {
    if (nodesToExcludeSet.has(nodeIdentifier)) {
      continue;
    }

    const remainingNeighborSet = new Set();
    for (const connectedNode of neighborSet) {
      if (!nodesToExcludeSet.has(connectedNode)) {
        remainingNeighborSet.add(connectedNode);
      }
    }

    if (remainingNeighborSet.size > 0) {
      resultingGraphState.set(nodeIdentifier, remainingNeighborSet);
    }
  }
  return resultingGraphState;
}

function determineGameOutcome(currentGraphState) {
  if (currentGraphState.size === 1) {
    return 1;
  }

  const allCurrentLeaves = new Set();
  for (const [nodeId, neighbors] of currentGraphState.entries()) {
    if (neighbors.size === 1) {
      allCurrentLeaves.add(nodeId);
    }
  }

  let outcomeScenarioA = null;
  if (allCurrentLeaves.size > 0) {
    const graphAfterAllLeavesRemoved = removeNodesAndConnections(currentGraphState, allCurrentLeaves);
    if (graphAfterAllLeavesRemoved.size > 0) {
      outcomeScenarioA = determineGameOutcome(graphAfterAllLeavesRemoved);
    } else {
      outcomeScenarioA = 0;
    }
  }

  const firstLeafNode = allCurrentLeaves.values().next().value;

  let outcomeScenarioB;
  if (firstLeafNode !== undefined) {
    const leavesToExcludeForScenarioB = new Set(allCurrentLeaves);
    leavesToExcludeForScenarioB.delete(firstLeafNode);

    const graphForScenarioB = removeNodesAndConnections(currentGraphState, leavesToExcludeForScenarioB);
    outcomeScenarioB = determineGameOutcome(graphForScenarioB);
  } else {
    outcomeScenarioB = 0;
  }

  if (outcomeScenarioA === null) {
    return (outcomeScenarioB + 1) % 2;
  } else if (outcomeScenarioA !== outcomeScenarioB) {
    return 1;
  } else {
    return (outcomeScenarioA + 1) % 2;
  }
}

function processGraphGame(inputData) {
  const parserInstance = createInputParser(inputData);

  const nodeCount = parserInstance.fetchNextValue();

  const graphAdjacency = new Map();
  for (let k = 1; k <= nodeCount; k++) {
    graphAdjacency.set(k, new Set());
  }

  for (let k = 0; k < nodeCount - 1; k++) {
    const nodeU = parserInstance.fetchNextValue();
    const nodeV = parserInstance.fetchNextValue();

    graphAdjacency.get(nodeU).add(nodeV);
    graphAdjacency.get(nodeV).add(nodeU);
  }

  const finalOutcome = determineGameOutcome(graphAdjacency);
  if (finalOutcome === "solved") {
    console.log("First");
  } else {
    console.log(finalOutcome % 2 === 1 ? "First" : "Second");
  }
}

module.exports = createInputParser;
processGraphGame(require("fs").readFileSync("/dev/stdin", "utf8"));
