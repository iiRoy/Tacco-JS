function InputReader(inputString, parser) {
  this.sourceLines = inputString.split("\n");
  this.currentColumnIndex = 0;
  this.currentLineIndex = 0;
  this.parseFunction = parser || Number;
}

InputReader.prototype._processLineTokens = function(line) {
  if (!line) {
    return null;
  }
  return line.trim().split(" ");
};

InputReader.prototype.readNextValue = function() {
  let currentLine = this.sourceLines[this.currentLineIndex];
  let lineTokens = this._processLineTokens(currentLine);

  if (!lineTokens) {
    return undefined;
  }

  let tokenValue = lineTokens[this.currentColumnIndex];
  this.currentColumnIndex++;

  if (lineTokens.length === this.currentColumnIndex) {
    this.currentColumnIndex = 0;
    this.currentLineIndex++;
  }
  return this.parseFunction(tokenValue);
};

InputReader.prototype.readLineValues = function() {
  let currentLine = this.sourceLines[this.currentLineIndex];
  if (!currentLine) {
    return undefined;
  }
  this.currentColumnIndex = 0;
  this.currentLineIndex++;
  return currentLine.split(" ").map(val => this.parseFunction(val));
};

module.exports = InputReader;

function analyzeGraphProperties(nodeCount, adjacencyList) {
  let hasNodeDegreeSixOrMore = false;
  let allDegreesEven = true;

  for (let nodeIndex = 1; nodeIndex <= nodeCount; nodeIndex++) {
    const degree = adjacencyList[nodeIndex] ? adjacencyList[nodeIndex].length : 0;

    if (degree >= 6) {
      hasNodeDegreeSixOrMore = true;
    }

    if (degree % 2 !== 0) {
      allDegreesEven = false;
    }
  }
  return { hasNodeDegreeSixOrMore, allDegreesEven };
}

function main(inputContent) {
  const inputParser = new InputReader(inputContent);

  const nodeCount = inputParser.readNextValue();
  const edgeCount = inputParser.readNextValue();

  const adjacencyList = Array.from({ length: nodeCount + 1 }, () => []);

  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const nodeA = inputParser.readNextValue();
    const nodeB = inputParser.readNextValue();
    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA);
  }

  const { hasNodeDegreeSixOrMore, allDegreesEven } = analyzeGraphProperties(nodeCount, adjacencyList);

  const finalResult = (hasNodeDegreeSixOrMore && allDegreesEven) ? "Yes" : "No";
  console.log(finalResult);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
