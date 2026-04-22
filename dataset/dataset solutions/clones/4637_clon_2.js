// Internal utility functions start here, feel free to ignore this section.
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let dataProcessor;
const inputLines = [];

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  dataProcessor = initializeProcessor(inputLines);
  console.error('\n');
  const opStartTime = new Date();
  ExecuteLogic();
  const durationMs = new Date() - opStartTime;
  
  logDebug(`Execution time: ${durationMs}ms`);
  logDebug(`Memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

function createDeepCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function retrieveInt() {
  return transformValue(fetchNext(), 1);
}

function retrieveStrArray() {
  return transformValue(fetchNext(), 2);
}

function retrieveIntArray() {
  return transformValue(fetchNext(), 4);
}

function retrieveCharArr() {
  return transformValue(fetchNext(), 6);
}

function fetchNext() {
  return dataProcessor.fetchNext();
}

function hasMoreData() {
  return dataProcessor.hasMoreData();
}

function initializeProcessor(rawInputData) {  
  const processorInstance = {
    lineBuffer: rawInputData,
    currentIdx: 0,
    totalLines: rawInputData.length,
    hasMoreData: function() {
      return (this.currentIdx < this.totalLines);
    },
    fetchNext: function() {
      if (!this.hasMoreData()) {
        throw new Error("No more elements available: Index out of bounds.");
      } else {
        const fetchedLine = this.lineBuffer[this.currentIdx];
        this.currentIdx++;
        return fetchedLine;
      }
    }
  };
  return processorInstance;
}

function displayOutput(messageContent) {
  console.log(messageContent);
}

function logDebug(debugMessage) {
  console.error("debug output:" + require("util").inspect(debugMessage, false, null));
}

// Data transformation utility.
// Handles various parsing and formatting operations for input values.
// If conversionType is unknown or an error occurs, the input value is returned unchanged.
// 1: Convert to integer.
// 2: Split by space into a string array.
// 4: Split by space and convert to an array of numbers.
// 6: Split into a character array.
// 7: Split into a character array and convert to an array of numbers.
// 8: Join array elements with a space.
// 9: Join array elements with a newline.
// 0: Join array elements without any separator.
function transformValue(inputValue, conversionType) {
  try {
    switch (conversionType) {
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
  } catch (caughtError) {
    return inputValue;
  }
}

// End of internal utilities.

function ExecuteLogic() {
  const initialParams = retrieveIntArray();
  const itemCount = initialParams[0];
  const requiredItems = initialParams[1];
  const valueList = retrieveIntArray();
  let minimizedValue = 1e16; // Represents Math.pow(10, 16)

  if (requiredItems === 1) {
    displayOutput(0);
    return;
  }

  for (let combinationIndex = 0; combinationIndex < (1 << itemCount); combinationIndex++) {
    const currentSelection = [valueList[0]];
    for (let loopCounter = 1; loopCounter < itemCount; loopCounter++) {
      if ((combinationIndex & (1 << loopCounter)) !== 0) {
        currentSelection.push(valueList[loopCounter]);
      }
    }

    if (currentSelection.length === requiredItems) {
      let accumulatedCost = 0;
      for (let loopCounter = 0; loopCounter < currentSelection.length - 1; loopCounter++) {
        if (currentSelection[loopCounter] >= currentSelection[loopCounter + 1]) {
          const adjustment = currentSelection[loopCounter] - currentSelection[loopCounter + 1] + 1;
          accumulatedCost += adjustment;
          currentSelection[loopCounter + 1] += adjustment;
        }
      }
      minimizedValue = Math.min(minimizedValue, accumulatedCost);
    }
  }
  displayOutput(minimizedValue);
}