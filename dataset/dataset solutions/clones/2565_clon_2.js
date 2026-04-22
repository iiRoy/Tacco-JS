var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var receivedLines = [];

lineReader.on('line', function(lineData) {
  receivedLines.push(lineData);
});

lineReader.on('close', function() {
  dataHandler = prepareInput(receivedLines);
  console.error("\n"); 
  var startTime = Date.now();
  ExecuteLogic();
  var elapsedTime = Date.now() - startTime;
  logDebugMessage("execution_time : " + elapsedTime + "ms");
  logDebugMessage("memory_usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

function getNextInteger() {
  return processConversion(retrieveNext(), 1);
}

function getNextStringArray() {
  return processConversion(retrieveNext(), 2);
}

function getNextIntegerArray() {
  return processConversion(retrieveNext(), 4);
}

function getNextCharList() {
  return processConversion(retrieveNext(), 6);
}

function retrieveNext() {
  return dataHandler.retrieveNext();
}

function hasRemaining() {
  return dataHandler.hasRemaining();
}

function prepareInput(inputLines) {
  return {
    sourceList: inputLines,
    currentPointer: 0,
    listBoundary: inputLines.length,
    hasRemaining: function() {
      return (this.currentPointer < this.listBoundary);
    },
    retrieveNext: function() {
      if (this.hasRemaining()) {
        return this.sourceList[this.currentPointer++];
      } else {
        throw "InputBoundaryExceededException: No more data available for processing";
      }
    }
  };
}

function printOutput(messageContent) {
  console.log(messageContent);
}

function logDebugMessage(messageContent) {
  console.error("diagnostic_info:" + require("util").inspect(messageContent, false, null));
}

// The 'conversionType' parameter dictates the transformation applied to the input value.
// Possible conversion types:
// 1: Parse string to an integer.
// 2: Split string by spaces into an array of strings.
// 4: Split string by spaces and convert parts to numbers.
// 6: Split string into an array of individual characters.
// 7: Split string into characters and convert them to numbers (if applicable).
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without any separator.
// Default: Return the input value unchanged.
function processConversion(inputValue, conversionType) {
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
  } catch (errorOccurred) {
    return inputValue;
  }
}

// This section contains the core algorithm logic.
function ExecuteLogic() {
  var entryCount = getNextInteger(); 
  var charChain = getNextCharList(); 
  var maximumOverlap = 0; 
  
  // Continue processing as long as the character sequence is not empty.
  while (charChain.length > 0) {
    // Initialize an array to store Z-algorithm values for the current sequence.
    var patternMatches = new Array(charChain.length);
    patternMatches[0] = charChain.length; 
    
    var currentPos = 1; 
    var matchLen = 0; 
    
    // Compute Z-values for the string.
    while (currentPos < charChain.length) {
      while ((currentPos + matchLen) < charChain.length && (charChain[matchLen] === charChain[currentPos + matchLen])) {
        matchLen++;
      }
      patternMatches[currentPos] = matchLen; 
      
      if (matchLen === 0) {
        currentPos++; 
        continue; 
      }
      
      var offsetVal = 1; 
      while ((currentPos + offsetVal) < charChain.length && (offsetVal + patternMatches[offsetVal] < matchLen)) {
        patternMatches[currentPos + offsetVal] = patternMatches[offsetVal];
        offsetVal++;
      }
      currentPos += offsetVal; 
      matchLen -= offsetVal; 
    }
    
    // Scan the computed Z-array to find the largest valid overlap.
    for (var reverseIdx = charChain.length - 1; reverseIdx >= 1; reverseIdx--) {
      if (patternMatches[reverseIdx] <= charChain.length / 2) {
        maximumOverlap = Math.max(maximumOverlap, patternMatches[reverseIdx]);
      }
    }
    charChain.shift(); // Remove the first element to process the suffix in the next iteration.
  }
  
  printOutput(maximumOverlap); 
}