"use strict";

class InputParser {
  constructor(sourceString, parseFunction) {
    this.lines = sourceString.split("\n");
    this.currentColumn = 0;
    this.currentLine = 0;
    this.parseFunction = parseFunction || Number;
  }

  _extractTokensFromCurrentLine() {
    const lineContent = this.lines[this.currentLine];
    if (!lineContent) {
      return null;
    }
    return lineContent.trim().split(" ");
  }

  readNextToken() {
    let lineTokens = this._extractTokensFromCurrentLine();
    if (lineTokens === null) {
      return undefined;
    }

    const tokenString = lineTokens[this.currentColumn];
    this.currentColumn++;

    if (lineTokens.length === this.currentColumn) {
      this.currentColumn = 0;
      this.currentLine++;
    }
    return this.parseFunction(tokenString);
  }

  readLineTokens() {
    const lineContent = this.lines[this.currentLine];
    if (!lineContent) {
      return undefined;
    }
    this.currentColumn = 0;
    this.currentLine++;
    return lineContent.split(" ").map(this.parseFunction);
  }
}

module.exports = InputParser;

function processInput(inputData) {
  const parserInstance = new InputParser(inputData);

  const nodeCount = parserInstance.readNextToken();
  const edgeCount = parserInstance.readNextToken();

  const initializeAdjacencyStructure = (numNodes) => {
    const adjacencyContainer = [];
    for (let i = 1; i <= numNodes; i++) {
      adjacencyContainer[i] = [];
    }
    return adjacencyContainer;
  };

  const adjacencyList = initializeAdjacencyStructure(nodeCount);

  const populateGraphEdges = (dataParser, graphAdjacency, numberOfEdges) => {
    for (let i = 0; i < numberOfEdges; i++) {
      const firstNode = dataParser.readNextToken();
      const secondNode = dataParser.readNextToken();
      graphAdjacency[firstNode].push(secondNode);
      graphAdjacency[secondNode].push(firstNode);
    }
  };

  populateGraphEdges(parserInstance, adjacencyList, edgeCount);

  const evaluateGraphConditions = (graphAdjacency, totalNodes) => {
    let hasNodeWithDegreeSix = false;
    let allDegreesAreEven = true;

    // Check for a node with degree 6
    for (let i = 1; i <= totalNodes; i++) {
      const currentDegree = graphAdjacency[i].length;
      if (currentDegree === 6) {
        hasNodeWithDegreeSix = true;
        // No break here to ensure full iteration if original logic implies it,
        // though for this specific flag, a break would be a safe optimization.
        // Keeping it as is to avoid any subtle behavioral change.
      }
    }

    // Check if all nodes have even degrees
    for (let i = 1; i <= totalNodes; i++) {
      const currentDegree = graphAdjacency[i].length;
      if (currentDegree % 2 !== 0) {
        allDegreesAreEven = false;
        break; // Safe optimization: once an odd degree is found, no need to check further
      }
    }

    return hasNodeWithDegreeSix && allDegreesAreEven;
  };

  const finalConditionMet = evaluateGraphConditions(adjacencyList, nodeCount);

  const outputMessage = finalConditionMet ? "Yes" : "No";
  console.log(outputMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
