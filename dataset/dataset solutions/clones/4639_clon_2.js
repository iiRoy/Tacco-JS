var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputAccessor;
var bufferedData = [];
lineReader.on('line', function(lineData) {
  bufferedData.push(lineData);
});
lineReader.on('close', function() {
  inputAccessor = setupReader(bufferedData);
  console.error(" "); 
  var processStart = new Date();
  RunSolution();
  var duration = new Date() - processStart;
  
  debugInfo("Execution time : " + (duration) + "ms");
  debugInfo("Memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createCopy(originalObj) {
  return JSON.parse(JSON.stringify(originalObj));
}
function fetchNum() {
  return transformValue(advanceInput(), 1);
}
function getStrArr() {
  return transformValue(advanceInput(), 2);
}
function getNumArr() {
  return transformValue(advanceInput(), 4);
}
function getCharArr() {
  return transformValue(advanceInput(), 6);
}
function advanceInput() {
  return inputAccessor.fetchNextLine();
}
function moreAvailable() {
  return inputAccessor.hasMoreData();
}
function setupReader(sourceLines) {  
  var dataAccessObject = {
    sourceLines : sourceLines,
    linePointer : 0,
    totalLines : sourceLines.length,
    hasMoreData : function() {
      return (this.linePointer < this.totalLines);
    },
    fetchNextLine : function() {
      if (!this.hasMoreData()) {
        throw "InputBoundaryExceeded No more data available";
      } else {
        var itemToReturn = this.sourceLines[this.linePointer];
        this.linePointer++;
        return itemToReturn;
      }
    }
  };
  return dataAccessObject;
}
function displayResult(dataToLog) {
  console.log(dataToLog);
}
function debugInfo(infoString) {
  console.error("trace: " + require("util").inspect(infoString, false, null));
}
// This utility function handles various data type conversions.
// - Default: Returns input as is.
// - 1: Convert to integer.
// - 2: Split by space into string array.
// - 4: Split by space into number array.
// - 6: Split by character into string array.
// - 7: Split by character into number array.
// - 8: Join array elements with space.
// - 9: Join array elements with newline.
// - 0: Join array elements without separator.
function transformValue(dataToConvert, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(dataToConvert);
      case 2:
        return dataToConvert.split(" ");
      case 4:
        return dataToConvert.split(" ").map(Number);
      case 6:
        return dataToConvert.split("");
      case 7:
        return dataToConvert.split("").map(Number);
      case 8:
        return dataToConvert.join(" ");
      case 9:
        return dataToConvert.join("\n");
      case 0:
        return dataToConvert.join("");
      default:
        return dataToConvert;
    }
  } catch (err) {
    return dataToConvert;
  }
}

// End of helper functions. The primary algorithm starts here.
function RunSolution() {
  var configValues = getNumArr();
  var sizeN = configValues[0];
  var minSelection = configValues[1];
  var dataItems = getNumArr();
  var calculatedMin = Math.pow(10, 15);
  if (minSelection === 1) {
    displayResult(0);
    return;
  }
  for (let combinationCounter = 0; combinationCounter < (1 << sizeN); combinationCounter++) {
    var pickedItems = [dataItems[0]];
    for (let itemIterator = 1; itemIterator < sizeN; itemIterator++) {
      if ((combinationCounter & (1 << itemIterator)) !== 0) {
        // Select this element for the current combination
        pickedItems.push(dataItems[itemIterator]);
      }
    }
    if (pickedItems.length >= minSelection) {
      var totalAdjustment = 0;
      // debugInfo(pickedItems); 
      for (let elementIndex = 0; elementIndex < pickedItems.length - 1; elementIndex++) {
        if (pickedItems[elementIndex] >= pickedItems[elementIndex + 1]) {
          totalAdjustment += pickedItems[elementIndex] - pickedItems[elementIndex + 1] + 1;
          pickedItems[elementIndex + 1] += pickedItems[elementIndex] - pickedItems[elementIndex + 1] + 1;
        }
      }
      calculatedMin = Math.min(calculatedMin, totalAdjustment);
    }
  }
  displayResult(calculatedMin);
}