"use strict";

function InputParser(sourceString, parseFunction) {
  this._sourceLines = sourceString.split("\n");
  this._currentColumn = 0;
  this._currentLine = 0;
  this._parseFunction = parseFunction || Number;
}

InputParser.prototype.readNextValue = function() {
  let currentLineText = this._sourceLines[this._currentLine];
  if (!currentLineText) return;

  let lineTokens = currentLineText.trim().split(" ");
  let tokenValue = lineTokens[this._currentColumn];
  this._currentColumn++;
  if (lineTokens.length === this._currentColumn) {
    this._currentColumn = 0;
    this._currentLine++;
  }
  return this._parseFunction(tokenValue);
};

InputParser.prototype.readAllOnLine = function() {
  let currentLineText = this._sourceLines[this._currentLine];
  if (!currentLineText) return;
  this._currentColumn = 0;
  this._currentLine++;
  return currentLineText.split(" ").map(this._parseFunction);
};

module.exports = InputParser;

function processGraphData(rawData) {
  const dataReader = new InputParser(rawData);

  const numNodes = dataReader.readNextValue();
  const numEdges = dataReader.readNextValue();

  const adjacencyList = [];
  for (let nodeIndex = 1; nodeIndex <= numNodes; nodeIndex++) {
    adjacencyList[nodeIndex] = [];
  }

  for (let edgeCounter = 0; edgeCounter < numEdges; edgeCounter++) {
    let nodeA = dataReader.readNextValue();
    let nodeB = dataReader.readNextValue();
    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA);
  }

  let hasSixDegreeNode = false;
  let allEvenDegrees = true;
  for (let nodeIndex = 1; nodeIndex <= numNodes; nodeIndex++) {
    if (adjacencyList[nodeIndex].length === 6) {
      hasSixDegreeNode = true;
    }

    if (adjacencyList[nodeIndex].length % 2 !== 0) {
      allEvenDegrees = false;
    }
  }

  console.log((hasSixDegreeNode && allEvenDegrees) ? "Yes" : "No");
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
