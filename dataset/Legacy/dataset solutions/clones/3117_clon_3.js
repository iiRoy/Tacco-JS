"use strict";

function InputReader(sourceString, parseFn) {
  this.inputLines = sourceString.split("\n");
  this.columnIndex = 0;
  this.lineIndex = 0;
  this.valueParser = parseFn || Number;
}

function shouldAdvanceLine(currentTokens, currentColumn) {
  return currentTokens.length === currentColumn;
}

InputReader.prototype.readNextToken = function() {
  const currentLineStr = this.inputLines[this.lineIndex];
  if (!currentLineStr) {
    return;
  }

  const currentLineTokens = currentLineStr.trim().split(" ");
  const tokenValue = currentLineTokens[this.columnIndex];
  this.columnIndex++;

  if (shouldAdvanceLine(currentLineTokens, this.columnIndex)) {
    this.columnIndex = 0;
    this.lineIndex++;
  }
  return this.valueParser(tokenValue);
};

InputReader.prototype.readLineTokens = function() {
  const currentLineStr = this.inputLines[this.lineIndex];
  if (!currentLineStr) {
    return;
  }
  this.columnIndex = 0;
  this.lineIndex++;
  return currentLineStr.split(" ").map(this.valueParser);
};

module.exports = InputReader;

function isOdd(num) {
  return num % 2 !== 0;
}

function processGraphData(rawInputString) {
  const dataParser = new InputReader(rawInputString);

  const nodeCount = dataParser.readNextToken();
  const edgeCount = dataParser.readNextToken();

  const graphAdjacencyList = Array.from({ length: nodeCount + 1 }, () => []);

  for (let i = 0; i < edgeCount; i++) {
    const nodeIdentifierA = dataParser.readNextToken();
    const nodeIdentifierB = dataParser.readNextToken();
    graphAdjacencyList[nodeIdentifierA].push(nodeIdentifierB);
    graphAdjacencyList[nodeIdentifierB].push(nodeIdentifierA);
  }

  let hasDegreeSixNode = false;
  let degreeFourNodeCount = 0;
  let allDegreesAreEven = true;

  for (let i = 1; i <= nodeCount; i++) {
    const currentNodeDegree = graphAdjacencyList[i].length;

    if (currentNodeDegree === 6) {
      hasDegreeSixNode = true;
    }

    if (currentNodeDegree == 4) {
      degreeFourNodeCount += 1;
    }

    if (isOdd(currentNodeDegree)) {
      allDegreesAreEven = false;
    }
  }

  const conditionForSixOrFour = hasDegreeSixNode || degreeFourNodeCount >= 2;
  const finalDecision = conditionForSixOrFour && allDegreesAreEven;

  console.log(finalDecision ? "Yes" : "No");
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
