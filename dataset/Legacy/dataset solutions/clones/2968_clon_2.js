var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

// This object manages the input stream for the program.
var dataStream = {
  "sourceLines" : rawData,
  "currentIdx"  : 0,
  "totalLines"  : rawData.length,

  "fetchNext" : function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var retrievedItem = this.sourceLines[this.currentIdx];
    this.currentIdx++;
    return retrievedItem;
  },

  "hasMore" : function() {
    return (this.currentIdx < this.totalLines);
  }
};

executeProgram();

function getNextItem() {
  return dataStream.fetchNext();
}

function checkMoreItems() {
  return dataStream.hasMore();
}

function printOutput(content) {
  console.log(content); // Standard output operation
}

function printError(message) {
  console.error(message); // Standard error operation
}

// Utility function for various input conversions.
// If conversion fails or type is unknown, returns original input.
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((val) => Number(val));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((val) => Number(val));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (err) {
    return inputValue; // Return original value on error
  }
}

function executeProgram() {
  var firstLineData = convertInput(getNextItem(), 4);
  var numNodes = firstLineData[0];
  var numEdges = firstLineData[1];

  var graphNodes = new Array(numNodes);
  for (var nodeIndex = 0; nodeIndex < numNodes; nodeIndex++) {
    graphNodes[nodeIndex] = {
      "connectedNodes": [],
      "isVisited": false
    };
  }

  for (var edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
    var edgePair = convertInput(getNextItem(), 4);
    // Adjusting for 0-based indexing
    graphNodes[edgePair[0] - 1].connectedNodes.push(edgePair[1] - 1);
    graphNodes[edgePair[1] - 1].connectedNodes.push(edgePair[0] - 1);
  }

  var componentCount = 0;
  for (var loopCounter = 0; loopCounter < numNodes; loopCounter++) {
    if (!graphNodes[loopCounter]["isVisited"]) {
      depthFirstSearch(loopCounter);
      componentCount++;
    }
  }

  // Inner function for Depth First Search traversal
  function depthFirstSearch(currentNodeIdx) {
    graphNodes[currentNodeIdx]["isVisited"] = true;
    var neighborNodes = graphNodes[currentNodeIdx]["connectedNodes"];

    // printOutput(currentNodeIdx + " : " + neighborNodes);

    for (var neighborLoop = 0; neighborLoop < neighborNodes.length; neighborLoop++) {
      var currentNeighbor = neighborNodes[neighborLoop];
      if (graphNodes[currentNeighbor]["isVisited"]) {
        continue;
      }
      // This condition `currentNeighbor == currentNodeIdx` is often redundant
      // in an undirected graph DFS, but it's part of the original logic.
      if (currentNeighbor == currentNodeIdx) {
        continue;
      }
      depthFirstSearch(currentNeighbor);
    }
  }

  printOutput(componentCount);
}
