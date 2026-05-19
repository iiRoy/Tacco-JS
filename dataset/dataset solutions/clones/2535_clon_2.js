var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

// Event listener for end of input
inputReader.on('close', function(){
  dataProcessor = initializeInput(inputLines); // Prepare input for processing
  console.error("\n"); // Print a newline to stderr for formatting
  var startTime = Date.now(); // Record start time
  executeMainLogic(); // Run the primary application logic
  var endTime = Date.now() - startTime; // Calculate elapsed time
  logDebugMessage("time : " + endTime + "ms"); // Log execution time
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Log memory usage
});

// Utility function to create a deep copy of an object
function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

// Helper functions to retrieve and convert input data
function getNextInteger(){ return convertInput(fetchNextItem(), 1); }
function getNextStringArray(){ return convertInput(fetchNextItem(), 2); }
function getNextIntegerArray(){ return convertInput(fetchNextItem(), 4); }
function getNextCharacterArray(){ return convertInput(fetchNextItem(), 6); }

function fetchNextItem(){ return dataProcessor.retrieveNext(); }
function hasMoreItems(){ return dataProcessor.checkMoreAvailable(); }

// Initializes the input processing object
function initializeInput(inputArray){
  return {
    sourceData : inputArray,
    currentPosition : 0,
    maximumLength : inputArray.length,
    checkMoreAvailable : function(){
      return (this.currentPosition < this.maximumLength);
    },
    retrieveNext : function(){
      if(this.checkMoreAvailable()){
        return this.sourceData[this.currentPosition++];
      } else {
        throw "InputOutOfBoundsException: No more input available.";
      }
    }
  };
}

// Function to print results to standard output
function printResult(outputValue){
  console.log(outputValue);
}

// Function to log debug messages to standard error
function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

// Input conversion utility
// 'conversionType' parameter:
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space and parse as numbers.
// 6: Split into individual characters.
// 7: Split into individual characters and parse as numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without separator.
// Default: Return input as is.
function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(error) {
    return inputValue; // Return original value on error
  }
}

// Main application logic
function executeMainLogic(){
  // Read the first line containing N and M
  var firstLineData = getNextIntegerArray();
  var numItems = firstLineData[0]; // N: total number of items
  var numOperations = firstLineData[1]; // M: total number of operations

  // Array to store details of each operation (1-indexed)
  var operationDetails = new Array(numOperations + 1);
  // Object to map items to the operations that unlock them
  var unlockingMechanisms = {};

  // Process each operation
  for(var opIndex = 0; opIndex < numOperations; opIndex++){
    var currentOperationInfo = getNextIntegerArray();
    var operationCost = currentOperationInfo[0]; // Cost of this operation
    var numSuccessItems = currentOperationInfo[1]; // Number of items unlocked by this operation
    var successItemsList = getNextIntegerArray(); // List of items unlocked

    // Store operation details
    operationDetails[opIndex + 1] = {
      operationCostValue : operationCost,
      successfulItems : successItemsList
    };

    // Populate the unlockingMechanisms map
    for(var itemIndex = 0; itemIndex < numSuccessItems; itemIndex++){
      var currentUnlockedItem = successItemsList[itemIndex];
      if(unlockingMechanisms[currentUnlockedItem] == null){
        unlockingMechanisms[currentUnlockedItem] = [];
      }
      unlockingMechanisms[currentUnlockedItem].push(opIndex + 1); // Add operation index
    }
  }

  // Initialize total cost and a set to track processed items
  var totalCost = 0;
  var processedItems = new Set();

  // Iterate through all items from 1 to N
  for(var itemCounter = 1; itemCounter <= numItems; itemCounter++){
    // If the current item has not been processed yet
    if(!processedItems.has(itemCounter)){
      var minimumCost = 100000000000; // A very large number for initial minimum cost
      var selectedOperationIndex = -1; // Index of the operation with minimum cost

      // Get operations that can unlock the current item
      var relevantOperations = unlockingMechanisms[itemCounter];

      // If no operation can unlock this item, it's impossible
      if(relevantOperations == null){
        printResult(-1);
        return; // Exit early
      }

      // Find the cheapest operation that unlocks the current item
      for(var opListIndex = 0; opListIndex < relevantOperations.length; opListIndex++){
        var currentOpId = relevantOperations[opListIndex];
        if(minimumCost > operationDetails[currentOpId].operationCostValue){
          minimumCost = operationDetails[currentOpId].operationCostValue;
          selectedOperationIndex = currentOpId;
        }
      }

      // Add the cost of the selected operation to the total
      totalCost += minimumCost;

      // Mark all items unlocked by the selected operation as processed
      for(var unlockedItemIdx = 0; unlockedItemIdx < operationDetails[selectedOperationIndex].successfulItems.length; unlockedItemIdx++){
        processedItems.add(operationDetails[selectedOperationIndex].successfulItems[unlockedItemIdx]);
      }
    }
  }

  // Output the final calculated total cost
  printResult(totalCost);
}
