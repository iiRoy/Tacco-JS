let inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputProcessor;
let capturedLines = [];

inputReader.on('line', function(currentLine) {
  capturedLines.push(currentLine);
});

inputReader.on('close', function() {
  inputProcessor = initializeProcessor(capturedLines);
  console.error(" "); // A blank line for visual separation
  let timingStart = Date.now();
  ExecuteMainLogic();
  let elapsedTime = Date.now() - timingStart;
  logError("Execution duration : " + elapsedTime + "ms");
  logError("Memory footprint : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function duplicateObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function getNextInteger() {
  return convertInput(retrieveNextItem(), 1);
}

function getNextStringArray() {
  return convertInput(retrieveNextItem(), 2);
}

function getNextIntegerArray() {
  return convertInput(retrieveNextItem(), 4);
}

function getNextCharacterArray() {
  return convertInput(retrieveNextItem(), 6);
}

function retrieveNextItem() {
  return inputProcessor.retrieveNextItem();
}

function hasMoreInput() {
  return inputProcessor.hasMoreInput();
}

function initializeProcessor(rawInputLines) {
  let processorInstance = {
    lineBuffer: rawInputLines,
    currentPosition: 0,
    maximumLines: rawInputLines.length,
    hasMoreInput: function() {
      return (this.currentPosition < this.maximumLines);
    },
    retrieveNextItem: function() {
      if (!this.hasMoreInput()) {
        throw "EndOfInputException -- No further input available";
      } else {
        let extractedLine = this.lineBuffer[this.currentPosition++];
        return extractedLine;
      }
    }
  };
  return processorInstance;
}

function displayOutput(message) {
  console.log(message);
}

function logError(errorDetails) {
  console.error("Debugging info: " + require("util").inspect(errorDetails, false, null));
}

// Helper function for type conversions:
// conversionType 1: parse as integer.
// conversionType 2: split by space.
// conversionType 4: split by space and parse as integers.
// conversionType 6: split into individual characters.
// conversionType 7: split into individual characters and parse as integers.
// conversionType 8: join array elements with spaces.
// conversionType 9: join array elements with newlines.
// conversionType 0: join array elements without any separator.
// Default: return item as is.
function convertInput(itemToConvert, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(itemToConvert, 10);
      case 2:
        return itemToConvert.split(" ");
      case 4:
        return itemToConvert.split(" ").map(Number);
      case 6:
        return itemToConvert.split("");
      case 7:
        return itemToConvert.split("").map(Number);
      case 8:
        return itemToConvert.join(" ");
      case 9:
        return itemToConvert.join("\n");
      case 0:
        return itemToConvert.join("");
      default:
        return itemToConvert;
    }
  } catch (e) {
    return itemToConvert;
  }
}

// Utility functions and input handling end
function ExecuteMainLogic() {
  let graphSize = getNextInteger();
  let adjacencyList = new Array(graphSize);

  for (let nodeIdx = 0; nodeIdx < graphSize; nodeIdx++) {
    adjacencyList[nodeIdx] = {
      childrenNodes: [],
      visitedFlag: false,
      nodeDepth: 1
    };
  }

  for (let rowIdx = 0; rowIdx < graphSize; rowIdx++) {
    let currentRowChars = getNextCharacterArray();
    for (let colIdx = 0; colIdx < graphSize; colIdx++) {
      if (rowIdx !== colIdx && currentRowChars[colIdx] === "1") {
        adjacencyList[rowIdx].childrenNodes.push(colIdx);
      }
    }
  }

  let finalResult = -1;
  let conditionMet = false;

  for (let currentNodeIndex = 0; currentNodeIndex < graphSize; currentNodeIndex++) {
    if (adjacencyList[currentNodeIndex].childrenNodes.length === 1) {
      conditionMet = true;
      let processingQueue = [currentNodeIndex];
      adjacencyList[currentNodeIndex].visitedFlag = true;

      while (processingQueue.length > 0) {
        let currentVertex = processingQueue.shift();
        let neighbors = adjacencyList[currentVertex].childrenNodes;

        for (let neighborIndex = 0; neighborIndex < neighbors.length; neighborIndex++) {
          if (!adjacencyList[neighbors[neighborIndex]].visitedFlag) {
            adjacencyList[neighbors[neighborIndex]].visitedFlag = true;
            adjacencyList[neighbors[neighborIndex]].nodeDepth = adjacencyList[currentVertex].nodeDepth + 1;
            finalResult = Math.max(finalResult, adjacencyList[currentVertex].nodeDepth + 1);
            processingQueue.push(neighbors[neighborIndex]);
          }
        }
      }
      break;
    }
  }

  if (!conditionMet) {
    displayOutput(finalResult);
    return;
  }

  for (let firstNode = 0; firstNode < graphSize - 1; firstNode++) {
    for (let secondNode = firstNode + 1; secondNode < graphSize; secondNode++) {
      if (adjacencyList[firstNode].nodeDepth === adjacencyList[secondNode].nodeDepth && (adjacencyList[firstNode].childrenNodes.indexOf(secondNode) !== -1 || adjacencyList[secondNode].childrenNodes.indexOf(firstNode) !== -1)) {
        logError({
          firstNode,
          secondNode
        });
        finalResult = -1;
        break;
      }
    }
  }
  displayOutput(finalResult);
}