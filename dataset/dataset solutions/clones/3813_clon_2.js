const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const inputLines = [];

// Collect all input lines as they arrive
inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

// Once all input is received, process it
inputReader.on('close', function(){
  dataProcessor = initializeInputProcessor(inputLines);
  console.error('\n'); // Add a newline for cleaner debug output
  const startTime = Date.now();
  executeSolution(); // Run the main program logic
  const endTime = Date.now() - startTime;
  logDebugMessage('Execution time: ' + endTime + 'ms');
  logDebugMessage('Memory usage: ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

/**
 * Creates a deep copy of an object or a Set.
 * For Sets, it creates a new Set from the elements.
 * For other objects, it uses JSON serialization/deserialization for a deep copy.
 * @param {any} originalObject - The object to be cloned.
 * @returns {any} A new object that is a deep copy of the original.
 */
function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Utility functions to fetch and convert the next input item
function getNextInteger(){ return convertInput(fetchNextItem(), 1); }
function getNextStringArray(){ return convertInput(fetchNextItem(), 2); }
function getNextIntegerArray(){ return convertInput(fetchNextItem(), 4); }
function getNextCharacterArray(){ return convertInput(fetchNextItem(), 6); }

// Functions to interact with the input data processor
function fetchNextItem(){ return dataProcessor.next(); }
function hasMoreItems(){ return dataProcessor.hasMoreItems(); }

/**
 * Initializes an object responsible for managing and providing input lines.
 * @param {string[]} linesArray - An array of strings, where each string is a line of input.
 * @returns {object} An object with methods to check for more input and retrieve the next line.
 */
function initializeInputProcessor(linesArray){
  return {
    lineList : linesArray,
    currentIndex : 0,
    maximumIndex : linesArray.length,
    hasMoreItems : function(){ return (this.currentIndex < this.maximumIndex); },
    next : function(){
      if(this.hasMoreItems()){
        return this.lineList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Function to output the final result to standard output
function printResult(outputValue){
  console.log(outputValue);
}

// Function to output debug messages to standard error
function logDebugMessage(messageContent){
  console.error('debug:' + require('util').inspect(messageContent, false, null));
}

/**
 * Converts the input data based on the specified conversion type.
 * This function handles various common input parsing scenarios.
 * @param {string|string[]} inputData - The data to be converted.
 * @param {number} conversionType - A numeric code indicating the desired conversion:
 *   1: Parse as an integer.
 *   2: Split string by spaces into an array of strings.
 *   4: Split string by spaces and map to numbers.
 *   6: Split string into an array of individual characters.
 *   7: Split string into individual characters and map to numbers.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline character.
 *   0: Join array elements without any separator.
 *   Any other value: Return the input data as is.
 * @returns {any} The converted data.
 */
function convertInput(inputData, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputData, 10);
      case 2: return inputData.split(' ');
      case 4: return inputData.split(' ').map(Number);
      case 6: return inputData.split('');
      case 7: return inputData.split('').map(Number);
      case 8: return inputData.join(' ');
      case 9: return inputData.join('\n');
      case 0: return inputData.join('');
      default: return inputData;
    }
  } catch(error){
    return inputData; // Return original input if conversion fails
  }
}

// Main function containing the problem's core logic
function executeSolution(){
  const totalElements = getNextInteger(); // Read the count of elements, N
  // Initialize an array to store the length of consecutive subsequences ending at each number.
  // Array size is N+1 to accommodate numbers from 1 to N.
  const sequenceCounts = new Array(totalElements + 1).fill(0);
  let longestSubsequenceLength = 0; // Tracks the maximum length found

  // Iterate N times to process each element provided in the input
  for(let idx = 0; idx < totalElements; idx++){
    const currentElement = getNextInteger(); // Read the current number 'a'
    // Update the count for the current element: it's 1 plus the count of the previous element (a-1).
    // This effectively counts how many consecutive numbers end at 'currentElement'.
    sequenceCounts[currentElement] = sequenceCounts[currentElement - 1] + 1;
    // Update the overall maximum length of a consecutive subsequence found so far.
    longestSubsequenceLength = Math.max(longestSubsequenceLength, sequenceCounts[currentElement]);
  }
  
  // The result is N minus the length of the longest consecutive increasing subsequence.
  // This represents the minimum number of elements to remove to achieve such a subsequence.
  printResult(totalElements - longestSubsequenceLength);
}
