"use strict";

function createDataStream(sourceContent, valueParser = Number) {
  const contentLines = sourceContent.split("\n");
  let linePointer = 0;
  let tokenPointer = 0;
  let currentParsedLineTokens = [];

  const advanceToNextLine = () => {
    if (linePointer >= contentLines.length) {
      currentParsedLineTokens = [];
      return false;
    }
    const rawLine = contentLines[linePointer];
    linePointer++;
    tokenPointer = 0;
    currentParsedLineTokens = rawLine ? rawLine.trim().split(" ") : [];
    return true;
  };

  advanceToNextLine();

  return {
    retrieveNextToken() {
      while (tokenPointer >= currentParsedLineTokens.length) {
        if (!advanceToNextLine()) {
          return undefined;
        }
      }

      const tokenValue = currentParsedLineTokens[tokenPointer];
      tokenPointer++;
      return valueParser(tokenValue);
    },
    retrieveCurrentLineTokens() {
      while (tokenPointer >= currentParsedLineTokens.length) {
        if (!advanceToNextLine()) {
          return undefined;
        }
      }

      const remainingTokens = currentParsedLineTokens.slice(tokenPointer).map(valueParser);
      advanceToNextLine();
      return remainingTokens;
    }
  };
}

function processGraphData(sourceInput) {
  const dataReader = createDataStream(sourceInput);

  const nodeQuantity = dataReader.retrieveNextToken();
  const edgeQuantity = dataReader.retrieveNextToken();

  const connectionMap = new Map();
  Array.from({ length: nodeQuantity }, (_, idx) => idx + 1).forEach(nodeId => {
    connectionMap.set(nodeId, new Set());
  });

  Array.from({ length: edgeQuantity }).forEach(() => {
    const firstNode = dataReader.retrieveNextToken();
    const secondNode = dataReader.retrieveNextToken();
    connectionMap.get(firstNode).add(secondNode);
    connectionMap.get(secondNode).add(firstNode);
  });

  const allNodeDegrees = Array.from(connectionMap.values()).map(neighborSet => neighborSet.size);

  const hasSixDegreeNode = allNodeDegrees.some(degree => degree === 6);
  const allDegreesAreEven = allNodeDegrees.every(degree => degree % 2 === 0);

  console.log((hasSixDegreeNode && allDegreesAreEven) ? "Yes" : "No");
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
