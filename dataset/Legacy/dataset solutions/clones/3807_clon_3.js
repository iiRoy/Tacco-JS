var inputHandler = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var dataProcessor;
var receivedLines = [];

inputHandler.on('line', function(lineContent){
  receivedLines.push(lineContent);
});

inputHandler.on('close', function(){
  dataProcessor = setupInputProcessor(receivedLines);
  console.error("\n");
  var processStartTime = Date.now();
  solveProblem();
  var processEndTime = Date.now() - processStartTime;
  logErrorDebug("time : " + (processEndTime) + "ms");
  logErrorDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(sourceObj){
  return JSON.parse(JSON.stringify(sourceObj));
}

function readNextInteger(){ return performConversion(fetchNextItem(), 1); }
function readNextStringArray(){ return performConversion(fetchNextItem(), 2); }
function readNextIntegerArray(){ return performConversion(fetchNextItem(), 4); }
function readNextCharacterArray(){ return performConversion(fetchNextItem(), 6); }

function fetchNextItem(){ return dataProcessor.fetchNextItem(); }
function hasMoreItems(){ return dataProcessor.hasMoreItems(); }

function setupInputProcessor(inputDataArray){
  const processorInstance = {
    inputList : inputDataArray,
    currentIndex : 0,
    maximumIndex : inputDataArray.length,

    hasMoreItems : function(){
      return (this.currentIndex < this.maximumIndex);
    },
    fetchNextItem : function(){
      if(!this.hasMoreItems()){
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
      const itemToReturn = this.inputList[this.currentIndex];
      this.currentIndex++;
      return itemToReturn;
    }
  };
  return processorInstance;
}

function outputResult(message){
  console.log(message);
}

function logErrorDebug(debugMessage){
  console.error(`debug:${require("util").inspect(debugMessage, false, null)}`);
}

const conversionMap = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join("")
};

function performConversion(inputValue, conversionType){
  try {
    const handler = conversionMap[conversionType];
    return handler ? handler(inputValue) : inputValue;
  } catch(e) {
    return inputValue;
  }
}

//Don't have to see. end------------------------------------------

// Helper function to check the property: A + B == A ^ B
// This is true if and only if A & B == 0.
// Crucially, it must replicate the original behavior with `undefined` values,
// where `number + undefined` results in `NaN`, and `NaN === NaN` is `false`.
function checkXorSumEquality(currentAccumulatedSum, nextCandidateValue) {
    return (currentAccumulatedSum + nextCandidateValue === (currentAccumulatedSum ^ nextCandidateValue));
}

function solveProblem(){
  var inputArrayLength = readNextInteger();
  var dataArray = readNextIntegerArray();
  var totalValidSubarrays = 0;
  var leftBoundary = 0;
  var rightBoundary = 0;
  var currentWindowXorSum = dataArray[0]; // Initialize with the first element

  // The loop condition must be preserved exactly as it dictates termination
  while(leftBoundary < inputArrayLength || rightBoundary < inputArrayLength){
    // Determine the next element to consider for extending the window
    const potentialNextElementIndex = rightBoundary + 1;
    let nextElementValueForCheck;
    let canExtendWindow = false;

    // Explicitly check if the next element is within array bounds
    if (potentialNextElementIndex < inputArrayLength) {
        nextElementValueForCheck = dataArray[potentialNextElementIndex];
        // Use the helper function to check the XOR sum property
        canExtendWindow = checkXorSumEquality(currentWindowXorSum, nextElementValueForCheck);
    }
    // If potentialNextElementIndex >= inputArrayLength, nextElementValueForCheck remains undefined,
    // and canExtendWindow remains false, replicating the original `NaN === NaN` behavior.

    if(canExtendWindow){
      // If the property holds, extend the window to the right
      const currentWindowSize = rightBoundary - leftBoundary + 1;
      totalValidSubarrays += currentWindowSize; // Add count of subarrays ending at current rightBoundary
      rightBoundary++; // Move right boundary to include the new element
      // Update XOR sum with the newly included element (dataArray[rightBoundary] is now dataArray[old_rightBoundary + 1])
      currentWindowXorSum += dataArray[rightBoundary];
    } else {
      // If the property does not hold, or we are at the end of the array, shrink from the left
      currentWindowXorSum -= dataArray[leftBoundary]; // Remove element from XOR sum
      leftBoundary++; // Move left boundary

      // If the window becomes invalid (right pointer is behind left pointer), reset it
      if(rightBoundary < leftBoundary){
        rightBoundary = leftBoundary;
        // Re-initialize XOR sum with the new starting element at the new rightBoundary
        currentWindowXorSum = dataArray[rightBoundary];
      }
    }
  }
  outputResult(totalValidSubarrays + inputArrayLength);
}
