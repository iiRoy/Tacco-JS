const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputDataProcessor;
const receivedLines = [];

inputReader.on('line', (currentLine) => {
  receivedLines.push(currentLine);
});

inputReader.on('close', () => {
  inputDataProcessor = initializeInputProcessor(receivedLines);
  console.error("\n");
  const startTime = Date.now();
  executeMainLogic();
  const elapsedTime = Date.now() - startTime;
  logDebugMessage("execution time : " + elapsedTime + "ms");
  logDebugMessage("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger() {
  return convertInput(fetchNextLine(), 1);
}

function retrieveStringArray() {
  return convertInput(fetchNextLine(), 2);
}

function retrieveIntegerArray() {
  return convertInput(fetchNextLine(), 4);
}

function retrieveCharacterArray() {
  return convertInput(fetchNextLine(), 6);
}

function fetchNextLine() {
  return inputDataProcessor.advanceAndGet();
}

function hasMoreLines() {
  return inputDataProcessor.canAdvance();
}

function initializeInputProcessor(inputLinesBuffer) {
  const processorObject = {
    lineBuffer: inputLinesBuffer,
    currentPosition: 0,
    totalLines: inputLinesBuffer.length,
    canAdvance: function() {
      return (this.currentPosition < this.totalLines);
    },
    advanceAndGet: function() {
      if (!this.canAdvance()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        const lineToReturn = this.lineBuffer[this.currentPosition++];
        return lineToReturn;
      }
    }
  };
  return processorObject;
}

function printResult(outputValue) {
  console.log(outputValue);
}

function logDebugMessage(messageContent) {
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

function convertInput(inputValue, formatCode) {
  try {
    switch (formatCode) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function executeMainLogic() {
  const nodeCount = retrieveInteger();
  const nodeCollection = new Array(nodeCount);

  for (let idxA = 0; idxA < nodeCount; idxA++) {
    nodeCollection[idxA] = {
      connected: [],
      visited: false,
      level: 1
    };
  }

  for (let idxA = 0; idxA < nodeCount; idxA++) {
    const tempChars = retrieveCharacterArray();
    for (let idxB = 0; idxB < nodeCount; idxB++) {
      if (idxA !== idxB && tempChars[idxB] === "1") {
        nodeCollection[idxA].connected.push(idxB);
      }
    }
  }

  let finalResult = -1;
  let isStartNodeFound = false;
  for (let idxA = 0; idxA < nodeCount; idxA++) {
    if (nodeCollection[idxA].connected.length === 1) {
      isStartNodeFound = true;
      const processingQueue = [idxA];
      nodeCollection[idxA].visited = true;
      while (processingQueue.length > 0) {
        const currentNodeIndex = processingQueue.shift();
        const connectedNodes = nodeCollection[currentNodeIndex].connected;
        for (let idxC = 0; idxC < connectedNodes.length; idxC++) {
          if (!nodeCollection[connectedNodes[idxC]].visited) {
            nodeCollection[connectedNodes[idxC]].visited = true;
            nodeCollection[connectedNodes[idxC]].level = nodeCollection[currentNodeIndex].level + 1;
            finalResult = Math.max(finalResult, nodeCollection[currentNodeIndex].level + 1);
            processingQueue.push(connectedNodes[idxC]);
          }
        }
      }
      break;
    }
  }

  if (!isStartNodeFound) {
    printResult(finalResult);
    return;
  }
  for (let idxA = 0; idxA < nodeCount - 1; idxA++) {
    for (let idxB = idxA + 1; idxB < nodeCount; idxB++) {
      if (nodeCollection[idxA].level === nodeCollection[idxB].level &&
          (nodeCollection[idxA].connected.indexOf(idxB) !== -1 || nodeCollection[idxB].connected.indexOf(idxA) !== -1)) {
        logDebugMessage({
          i: idxA,
          j: idxB
        });
        finalResult = -1;
        break;
      }
    }
    if (finalResult === -1) {
      break;
    }
  }
  printResult(finalResult);
}
