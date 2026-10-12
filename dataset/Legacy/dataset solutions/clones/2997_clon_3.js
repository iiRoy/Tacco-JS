"use strict";
class InputParser {
  constructor(sourceText, parseFunction) {
    this._lines = sourceText.split("\n");
    this._currentColIndex = 0;
    this._currentRowIndex = 0;
    this._valueParser = parseFunction || Number;
  }

  readToken(customParser) {
    const currentLineContent = this._lines[this._currentRowIndex];
    if (!currentLineContent) {
      return undefined;
    }

    const lineTokens = currentLineContent.trim().split(" ");
    const tokenValue = lineTokens[this._currentColIndex];

    this._currentColIndex++;
    const isEndOfLine = lineTokens.length === this._currentColIndex;
    if (isEndOfLine) {
      this._currentColIndex = 0;
      this._currentRowIndex++;
    }

    return customParser ? customParser(tokenValue) : this._valueParser(tokenValue);
  }

  readAllTokensInLine(customParser) {
    const currentLineContent = this._lines[this._currentRowIndex];
    if (!currentLineContent) {
      return undefined;
    }
    this._currentColIndex = 0;
    this._currentRowIndex++;

    const parserToUse = customParser || this._valueParser;
    return currentLineContent.split(" ").map(parserToUse);
  }
}
module.exports = InputParser;

function processGraphInput(inputData) {
  const dataReader = new InputParser(inputData);

  const totalNodes = dataReader.readToken();

  const graphAdjacency = Array.from({ length: totalNodes + 1 }, () => []);
  graphAdjacency[0] = null;

  for (let edgeCounter = 0; edgeCounter < totalNodes - 1; edgeCounter++) {
    const nodeOne = dataReader.readToken();
    const nodeTwo = dataReader.readToken();

    graphAdjacency[nodeOne].push(nodeTwo);
    graphAdjacency[nodeTwo].push(nodeOne);
  }

  const solutionResult = determineWinner(graphAdjacency);

  if (solutionResult === "solved") {
    console.log("First");
  } else {
    const isFirstPlayerWinner = (solutionResult % 2 === 1);
    console.log(isFirstPlayerWinner ? "First" : "Second");
  }
}

function determineWinner(currentGraph) {
  const activeNodes = currentGraph.filter(Boolean);
  if (activeNodes.length === 1) {
    return 1;
  }

  const firstLeafNodeIndex = currentGraph.findIndex(nodeConnections => nodeConnections && nodeConnections.length === 1);

  const graphAfterAllLeavesRemoved = createGraphWithoutLeaves(currentGraph);
  let resultFromAllLeafRemoval;

  const remainingActiveNodesCount = graphAfterAllLeavesRemoved.filter(Boolean).length;
  if (remainingActiveNodesCount > 0) {
    resultFromAllLeafRemoval = determineWinner(graphAfterAllLeavesRemoved);
  }

  const leafOriginalConnections = currentGraph[firstLeafNodeIndex];
  const parentNodeOfLeaf = leafOriginalConnections[0];

  graphAfterAllLeavesRemoved[firstLeafNodeIndex] = leafOriginalConnections;
  if (graphAfterAllLeavesRemoved[parentNodeOfLeaf]) {
    graphAfterAllLeavesRemoved[parentNodeOfLeaf].push(firstLeafNodeIndex);
  }

  const resultFromSpecificLeafReinsertion = determineWinner(graphAfterAllLeavesRemoved);

  if (resultFromAllLeafRemoval === undefined) {
    return (resultFromSpecificLeafReinsertion + 1) % 2;
  }
  if (resultFromAllLeafRemoval !== resultFromSpecificLeafReinsertion) {
    return 1;
  } else {
    return (resultFromAllLeafRemoval + 1) % 2;
  }
}

function createGraphWithoutLeaves(originalGraph) {
  const leafNodeIndices = [];
  originalGraph.forEach((connections, index) => {
    if (connections && connections.length === 1) {
      leafNodeIndices.push(index);
    }
  });

  const leafSet = new Set(leafNodeIndices);

  const graphWithoutLeaves = Array.from({ length: originalGraph.length });

  originalGraph.forEach((connections, index) => {
    if (connections && connections.length > 1) {
      graphWithoutLeaves[index] = connections.filter(connectedNode => !leafSet.has(connectedNode));
    }
  });

  return graphWithoutLeaves;
}

processGraphInput(require("fs").readFileSync("/dev/stdin", "utf8"));
