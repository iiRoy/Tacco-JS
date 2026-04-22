const dataStream = require('readline').createInterface({
  input:  process.stdin,
  output: process.stdout
});
let parserInstance;
const receivedData = [];
dataStream.on('newLine', (currentLine) => { receivedData.push(currentLine); });
dataStream.on('finishedReading', () => {
  parserInstance = setupInputHandler(receivedData);
  console.warn("\n");
  const beginTime = Date.now();
  executeLogic();
  const duration = Date.now() - beginTime;
  logDebug(`execTime : ${duration} millis`);
  logDebug(`memUsage : ${Math.round(process.memoryUsage().heapTotal / 1024)} kilobytes`);
});

function cloneObject(sourceObj) {
  return JSON.parse(JSON.stringify(sourceObj));
}

function readInteger()   { return dataConverter(fetchNext(), 1); }
function readStringArray() { return dataConverter(fetchNext(), 2); }
function readIntArray()  { return dataConverter(fetchNext(), 4); }
function readCharArray() { return dataConverter(fetchNext(), 6); }
function fetchNext()     { return parserInstance.fetchNext(); }
function hasMore()       { return parserInstance.hasMore(); }

function setupInputHandler(lineBuffer) {
  const handlerObject = {
    lineCollection: lineBuffer,
    position: 0,
    totalLines: lineBuffer.length,

    hasMore: function() {
      return (this.position < this.totalLines);
    },

    fetchNext: function() {
      if (!this.hasMore()) {
        throw "NoMoreInputAvailable: End of data stream reached.";
      } else {
        const fetchedDatum = this.lineCollection[this.position];
        this.position++;
        return fetchedDatum;
      }
    }
  };
  return handlerObject;
}

function printResult(dataToOutput) {
  console.log(dataToOutput);
}

function logDebug(message) {
  console.warn("debug_output: " + require("util").inspect(message, false, null));
}

// Convert various input types based on 'mode' parameter.
// Mode 1: To integer.
// Mode 2: Split by space into string array.
// Mode 4: Split by space into number array.
// Mode 6: Split by character into string array.
// Mode 7: Split by character into number array.
// Mode 8: Join array with space.
// Mode 9: Join array with newline.
// Mode 0: Join array without separator.
// Default: Return as is. Handle errors by returning original value.
function dataConverter(inputValue, mode) {
  try {
    switch (mode) {
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
  } catch (err) {
    return inputValue; // In case of conversion error, return original.
  }
}

// Main program logic starts here.
// This is the core part of the application.
function executeLogic() {
  const initialData = readIntArray();
  const paramM = initialData[0];
  const paramK = initialData[1];

  if (paramK === 0) {
    const outputBuffer = new Array(Math.pow(2, paramM + 1));
    for (let idx = 0; idx < Math.pow(2, paramM); idx++) {
      outputBuffer[idx * 2]     = idx;
      outputBuffer[idx * 2 + 1] = idx;
    }
    printResult(dataConverter(outputBuffer, 8));
  } else {
    printResult(-1);
  }
}