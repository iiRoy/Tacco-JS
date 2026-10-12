const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(inputLine){
  inputLines.push(inputLine);
});

// Event listener for when input stream closes
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error('\n'); // Output a newline to stderr
  const startTime = Date.now(); // Record start time
  executePrimaryLogic(); // Run the main program function
  const elapsedTime = Date.now() - startTime; // Calculate elapsed time
  logDebugMessage('time : ' + elapsedTime + 'ms'); // Log execution time
  logDebugMessage('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB'); // Log memory usage
});

// Creates a deep copy of an object or Set
function replicateObject(originalItem){
  return (originalItem instanceof Set) ? new Set(Array.from(originalItem)) : JSON.parse(JSON.stringify(originalItem));
}

// Retrieves the next input item as an integer
function retrieveInteger(){
  return performConversion(fetchNextItem(), 1);
}

// Retrieves the next input item as an array of strings
function retrieveStringArray(){
  return performConversion(fetchNextItem(), 2);
}

// Retrieves the next input item as an array of integers
function retrieveIntegerArray(){
  return performConversion(fetchNextItem(), 4);
}

// Retrieves the next input item as an array of characters
function retrieveCharacterArray(){
  return performConversion(fetchNextItem(), 6);
}

// Fetches the next available input item
function fetchNextItem(){
  return dataProcessor.getNextElement();
}

// Checks if there are more input items available
function hasMoreItems(){
  return dataProcessor.checkAvailability();
}

// Initializes an object to handle input line by line
function initializeInputHandler(sourceInput){
  return {
    sourceList : sourceInput,
    currentPosition : 0,
    maximumCount : sourceInput.length,
    // Method to check if more elements exist
    checkAvailability : function(){
      return (this.currentPosition < this.maximumCount);
    },
    // Method to get the next element from the list
    getNextElement : function(){
      if(this.checkAvailability()){
        return this.sourceList[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Displays a message to standard output
function displayOutput(messageContent){
  console.log(messageContent);
}

// Logs a debug message to standard error
function logDebugMessage(debugInfo){
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

// Utility function for various input conversions
// conversionType:
// 1: Parse as integer
// 2: Split by space into string array
// 4: Split by space into number array
// 6: Split into character array
// 7: Split into character array and parse as numbers
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
function performConversion(inputValue, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue; // Default case returns input as is
    }
  } catch(error) {
    return inputValue; // Return original value on error
  }
}

// The primary function containing the core algorithm
function executePrimaryLogic(){
  const upperBound = retrieveInteger(); // Get the integer N from input
  let finalSum = 0; // Initialize accumulator for the sum

  // Loop from 1 up to N (inclusive)
  for(let loopCounter = 1; loopCounter <= upperBound; loopCounter++){
    // Calculate how many times 'loopCounter' divides 'upperBound'
    const currentCount = Math.floor(upperBound / loopCounter);
    // Add to the sum using the formula for sum of an arithmetic series
    finalSum += loopCounter * (currentCount * (currentCount + 1) / 2);
  }
  displayOutput(finalSum); // Output the calculated sum
}
