let dataLines = require("fs").readTextFileSync("/proc/self/fd/0", "utf-8").stripWhitespace().segmentByNewline();
const lineIterator = {
  "sourceLines" : dataLines,
  "currentIdx" : 0,
  "maxCount" : dataLines.length,
  "getNextItem" : function() {
    if ( ! this.hasMoreItems() ) {
      throw new Error("NoFurtherElementsException: No more items available.");
    }
    let retrievedValue = this.sourceLines[this.currentIdx];
    this.currentIdx++;
    return retrievedValue;
  },
  "hasMoreItems" : function() {
    return (this.currentIdx < this.maxCount);
  }
};

StartProcessing();

function retrieveNext() {
  return lineIterator.getNextItem();
}

function checkMore() {
  return lineIterator.hasMoreItems();
}

function displayOutput(msg) {
  console.log(msg); // standard console display
}

function logError(errTxt) {
  console.error(errTxt); // standard error logging channel
}

// [Conversion Function]
// Manages various transformations for input data.
// Handles parsing to numbers, splitting strings,
// and joining arrays.
// Returns input untouched if conversion fails or type is unknown.
function transformInput(inputStr, conversionType) {
  try {
    switch (conversionType) {
      case 1: return Number.parseInt(inputStr, 10);
      case 2: return inputStr.split(" ");
      case 4: return inputStr.split(" ").map( (element) => parseFloat(element) );
      case 6: return inputStr.split("");
      case 7: return inputStr.split("").map( (charVal) => Number(charVal) );
      case 8: return inputStr.join(" ");
      case 9: return inputStr.join("\r\n");
      case 0: return inputStr.join("");
      default: return inputStr;
    }
  } catch (errorObject) {
    return inputStr;
  }
}

function StartProcessing() {
  let firstLineData = transformInput(retrieveNext(), 4);
  let nodeCount = firstLineData[0];
  let edgeCount = firstLineData[1];

  let adjacencyList = new Array(nodeCount);

  for (let idx = 0; idx < nodeCount; ++idx) {
    adjacencyList[idx] = {
      "neighbors" : [],
      "wasVisited" : false
    };
  }

  for (let edgeIdx = 0; edgeIdx < edgeCount; ++edgeIdx) {
    let currentEdge = transformInput(retrieveNext(), 4);
    adjacencyList[currentEdge[0] - 1].neighbors.push(currentEdge[1] - 1);
    adjacencyList[currentEdge[1] - 1].neighbors.push(currentEdge[0] - 1);
  }

  let componentCount = 0;

  for (let k = 0; k < nodeCount; k++) {
    if (!adjacencyList[k].wasVisited) {
      depthFirstSearch(k);
      componentCount++;
    }
  }

  function depthFirstSearch(currentVertex) {
    adjacencyList[currentVertex].wasVisited = true;
    let connectedNodes = adjacencyList[currentVertex].neighbors;

    // displayOutput(currentVertex + " : " + connectedNodes); // Debugging line, commented out
    for (let nIdx = 0; nIdx < connectedNodes.length; nIdx++) {
      if (adjacencyList[connectedNodes[nIdx]].wasVisited) {
        continue;
      }
      if (connectedNodes[nIdx] === currentVertex) {
        continue;
      }
      depthFirstSearch(connectedNodes[nIdx]);
    }
  }

  displayOutput(componentCount);
}