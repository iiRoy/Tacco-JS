const inputReader = require('readline').createInterface(
  {
    dataStream: process.stdin,
    resultStream: process.stdout
  }
);
let dataContainer;
let receivedLines = [];

inputReader.on(
  'line',
  (currentLineText) => {
    receivedLines.push(currentLineText);
  }
);

inputReader.on(
  'close',
  () => {
    dataContainer = initializeProcessor(receivedLines);
    logDebug("---execution-begin---");
    const startTimeStamp = new Date();
    ExecutePrincipal();
    const elapsedDuration = new Date() - startTimeStamp;
    logDebug("---execution-end---");
    logDebug("duration: " + (elapsedDuration) + "ms");
  }
);

function retrieveInteger() { return dataConverter(getNextItem(), 1); }
function retrieveStringArray() { return dataConverter(getNextItem(), 2); }
function retrieveIntArray() { return dataConverter(getNextItem(), 4); }
function retrieveCharList() { return dataConverter(getNextItem(), 6); }

function getNextItem() { return dataContainer.retrieveElement(); }
function hasMoreElements() { return dataContainer.checkMoreElements(); }

function initializeProcessor(sourceData) {
  const processorInstance = {
    sourceList: sourceData,
    currentIndex: 0,
    maximumCount: sourceData.length,

    checkMoreElements: function () {
      return (this.currentIndex < this.maximumCount);
    },

    retrieveElement: function () {
      if (!this.checkMoreElements()) {
        throw "DataBoundaryExceeded: No further items available";
      } else {
        const currentElement = this.sourceList[this.currentIndex];
        this.currentIndex++;
        return currentElement;
      }
    }
  };
  return processorInstance;
}

const systemConsole = console;
function displayOutput(messageContent) { systemConsole.log(messageContent); }

const utilityModule = require('util');
function logDebug(debugValue) { systemConsole.error("diagnostic:" + utilityModule.inspect(debugValue, false, null)); }

// Description of operation codes for data conversion.
// Default/Error: Return input unchanged. Code 1: Convert to integer.
// Code 2: Split by space into string array. Code 4: Split by space into number array.
// Code 6: Split into character array. Code 7: Split into numeric character array.
// Code 8: Join with space. Code 9: Join with newline. Code 0: Join without separator.
function dataConverter(inputValue, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return Number.parseInt(inputValue);
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
  } catch (exceptionObject) {
    return inputValue;
  }
}

function ExecutePrincipal() {
  const limitLength = retrieveInteger();
  const sourceString = getNextItem();

  if (sourceString.length <= limitLength) {
    displayOutput(sourceString);
  } else {
    displayOutput(sourceString.slice(0, 7) + "...");
  }
}