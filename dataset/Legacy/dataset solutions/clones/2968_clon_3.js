function createInputReader(sourcePath = "/dev/stdin") {
  const fileContent = require("fs").readFileSync(sourcePath, "utf8");
  const lines = fileContent.trim().split("\n");
  let currentIndex = 0;
  const totalLinesCount = lines.length;

  return {
    fetchNext: function() {
      if (!this.hasMore()) {
        throw "NoSuchElementException:次に要素は無いよ";
      }
      const currentLine = lines[currentIndex];
      currentIndex++;
      return currentLine;
    },
    hasMore: function() {
      return (currentIndex < totalLinesCount);
    }
  };
}

const stdInput = createInputReader();

function getNextLine() {
  return stdInput.fetchNext();
}

function checkMoreLines() {
  return stdInput.hasMore();
}

function outputMessage(content) {
  console.log(content);
}

function errorMessage(content) {
  console.error(content);
}

const stringToNumber = (str) => Number(str);

function convertInput(value, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(value);
      case 2:
        return value.split(" ");
      case 4:
        return value.split(" ").map(stringToNumber);
      case 6:
        return value.split("");
      case 7:
        return value.split("").map(stringToNumber);
      case 8:
        return value.join(" ");
      case 9:
        return value.join("\n");
      case 0:
        return value.join("");
      default:
        return value;
    }
  } catch (error) {
    return value;
  }
}

function makeGraphNode() {
  return {
    "connections": [],
    "visitedStatus": false
  };
}

function performDepthFirstSearch(nodeIndex, graphStructure) {
  graphStructure[nodeIndex].visitedStatus = true;
  const connectedNodes = graphStructure[nodeIndex].connections;

  for (let i = 0; i < connectedNodes.length; i++) {
    const neighborIndex = connectedNodes[i];
    if (!graphStructure[neighborIndex].visitedStatus) {
      performDepthFirstSearch(neighborIndex, graphStructure);
    }
  }
}

function runGraphAnalysis() {
  const initialParams = convertInput(getNextLine(), 4);
  const totalNodes = initialParams[0];
  const totalEdges = initialParams[1];

  const graphRepresentation = new Array(totalNodes);
  for (let i = 0; i < totalNodes; i++) {
    graphRepresentation[i] = makeGraphNode();
  }

  for (let i = 0; i < totalEdges; i++) {
    const currentEdgeData = convertInput(getNextLine(), 4);
    const nodeOne = currentEdgeData[0] - 1;
    const nodeTwo = currentEdgeData[1] - 1;
    graphRepresentation[nodeOne].connections.push(nodeTwo);
    graphRepresentation[nodeTwo].connections.push(nodeOne);
  }

  let connectedComponentsCount = 0;
  for (let i = 0; i < totalNodes; i++) {
    if (!graphRepresentation[i].visitedStatus) {
      performDepthFirstSearch(i, graphRepresentation);
      connectedComponentsCount++;
    }
  }

  outputMessage(connectedComponentsCount);
}

runGraphAnalysis();
