/*
 *  This section contains setup and support functions.
 *  Please disregard the content above the main program entry.
 */

var streamAccessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var parsedInputSet;
var capturedInputElements = [];

streamAccessor.on('line', function (currentDataLine) {
  capturedInputElements.push(currentDataLine);
});

streamAccessor.on('close', function()
{
  parsedInputSet = inputProcessor(capturedInputElements);
  console.error(" ");
  var initialTimestamp = new Date();

  executePrimaryLogic();

  var finalTimestamp = new Date() - initialTimestamp;
  
  logDiagnostic("execution time: " + (finalTimestamp) + " milliseconds");
  logDiagnostic("allocated memory: " + Math.round(process.memoryUsage().heapTotal / 1024) + " KB");
});

function duplicateObject(originalObj) {
  return JSON.parse(JSON.stringify(originalObj));
}

function fetchInteger() { return dataConversionUtility(getNextElement(), 1); }
function fetchStringArray() { return dataConversionUtility(getNextElement(), 2); }
function fetchNumericArray() { return dataConversionUtility(getNextElement(), 4); }
function fetchCharacterArray() { return dataConversionUtility(getNextElement(), 6); }

function getNextElement() { return parsedInputSet.retrieveNext(); }
function hasMoreElements() { return parsedInputSet.checkAvailability(); }

function inputProcessor(sourceDataCollection) {  
  var processInstance = {
    contentList: sourceDataCollection,
    currentIdx: 0,
    maximumIdx: sourceDataCollection.length,
    checkAvailability: function() {
      return (this.currentIdx < this.maximumIdx);
    },
    retrieveNext: function() {
      if (!this.checkAvailability()) {
        throw "DataExhaustedError No more entries to process";
      } else {
        var retrievedEntry = this.contentList[this.currentIdx];
        this.currentIdx++;
        return retrievedEntry;
      }
    }
  };
  return processInstance;
}

function outputResult(messageContent) {
  console.log(messageContent);
}

function logDiagnostic(debugInfo) {
  console.error("DIAGNOSTIC_OUTPUT: " + require("util").inspect(debugInfo, false, null));
}

/*
 *  Mapping for data type conversions:
 *  - Unknown/Error: Returns input as-is
 *  - 1: Convert to integer
 *  - 2: Split by space
 *  - 4: Split by space and convert to number array
 *  - 6: Split by character
 *  - 7: Split by character and convert to number array
 *  - 8: Join with space
 *  - 9: Join with newline
 *  - 0: Join without separator
 */
function dataConversionUtility(inputValue, conversionCode) {
  try {
    switch (conversionCode) {
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
    return inputValue;
  }
}

/*
 *  The primary application logic begins below this line.
 *  You can safely ignore the preceding utility functions.
 */
function executePrimaryLogic() {
  var inputValues = fetchNumericArray();
  var totalItems = inputValues[0];
  var pricePerUnit = inputValues[1];
  var bulkPurchaseCost = inputValues[2];
  outputResult(Math.min(bulkPurchaseCost, totalItems * pricePerUnit));
}