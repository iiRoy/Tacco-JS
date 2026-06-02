const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor; // Global object to manage the input stream
const inputLines = []; // Array to store all incoming lines from stdin

// Attach an event listener for each line of input received
inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

// Attach an event listener for when the input stream closes
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines); // Initialize the input handler
  console.error('\n--- Input Processing Complete, Initiating Main Logic ---'); // Debug message
  executeMainLogic(); // Call the primary function to solve the problem
});

/**
 * Creates a deep copy of an object or a Set.
 * This utility function ensures independent copies.
 * @param {any} originalObject - The object or Set to be cloned.
 * @returns {any} A new, deep copy of the input.
 */
function createDeepCopy(originalObject){
  return (originalObject instanceof Set)
    ? new Set(Array.from(originalObject))
    : JSON.parse(JSON.stringify(originalObject));
}

// Helper functions to fetch and convert the next input item based on type
function getNextInteger(){ return convertInput(fetchNextItem(), 0x1); }
function getNextStringArray(){ return convertInput(fetchNextItem(), 0x2); }
function getNextIntegerArray(){ return convertInput(fetchNextItem(), 0x4); }
function getNextCharacterArray(){ return convertInput(fetchNextItem(), 0x6); }

// Core functions for navigating through the processed input
function fetchNextItem(){ return dataProcessor.fetchNextItem(); }
function hasMoreItems(){ return dataProcessor.hasMoreItems(); }

/**
 * Initializes an input handler object that provides methods to consume input.
 * @param {string[]} rawInputData - An array of raw string lines from standard input.
 * @returns {object} An object with `hasMoreItems` and `fetchNextItem` methods.
 */
function initializeInputHandler(rawInputData){
  return {
    sourceList : rawInputData,
    currentPosition : 0x0,
    maximumCount : rawInputData.length,
    hasMoreItems : function(){
      return (this.currentPosition < this.maximumCount);
    },
    fetchNextItem : function(){
      if(this.hasMoreItems()){
        return this.sourceList[this.currentPosition++];
      } else {
        throw 'InputOutOfBoundsException: No more input available.';
      }
    }
  };
}

/**
 * Displays a given value to standard output.
 * This is the primary method for problem output.
 * @param {any} outputValue - The value to be printed.
 */
function displayResult(outputValue){
  console.log(outputValue);
}

/**
 * Logs debug information to standard error.
 * Useful for inspecting variables during development.
 * @param {any} debugValue - The value to log for debugging.
 */
function logDebugInfo(debugValue){
  console.error('DEBUG_INFO: ' + require('util').inspect(debugValue, false, null));
}

/**
 * Converts an input string based on a specified conversion type.
 * @param {string} inputValue - The input string to be converted.
 * @param {number} conversionType - An integer code indicating the desired conversion.
 * @returns {any} The converted value, or the original input if conversion fails or type is unknown.
 */
function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
      case 0x1: return parseInt(inputValue);
      case 0x2: return inputValue.split(' ');
      case 0x4: return inputValue.split(' ').map(Number);
      case 0x6: return inputValue.split('');
      case 0x7: return inputValue.split('').map(Number);
      case 0x8: return inputValue.join(' ');
      case 0x9: return inputValue.join('\n');
      case 0x0: return inputValue.join('');
      default: return inputValue;
    }
  } catch(err) {
    return inputValue; // In case of conversion error, return the original input
  }
}

// End of input processing and utility functions.

/**
 * The main execution logic for the problem.
 * This function implements the core algorithm to solve the task.
 */
function executeMainLogic(){
  const sequenceLength = getNextInteger(); // Read the integer N
  const initialState = 'S'; // Define the initial state character 'L'
  const charSequence = getNextCharacterArray(); // Read the input string as a character array
  const stateTracker = ['S']; // Initialize the state tracking array with 'S'

  // Iterate through the character sequence to determine subsequent states
  for(let idx = 0x0; idx < sequenceLength; idx++){
    // Check the current character in the sequence ('o' or 'x')
    if(charSequence[idx] === 'o'){
      // If the current state in the tracker is 'S'
      if(stateTracker[idx] === 'S'){
        // Special handling for the very first element (idx === 0)
        if(idx === 0x0){
          stateTracker.push(initialState); // Push the 'L' (initialState)
        } else {
          stateTracker.push(stateTracker[idx - 0x1]); // Push the previous state
        }
      } else { // If the current state in the tracker is 'W'
        // Determine the next state based on the previous state
        if(stateTracker[idx - 0x1] === 'S'){
          stateTracker.push('W'); // Push 'W'
        } else {
          stateTracker.push('S'); // Push 'S'
        }
      }
    } else { // If the current character in the sequence is 'x'
      // If the current state in the tracker is 'S'
      if(stateTracker[idx] === 'S'){
        // Special handling for the very first element (idx === 0)
        if(idx === 0x0){
          stateTracker.push('W'); // Push 'W'
        } else {
          // Determine the next state based on the previous state
          if(stateTracker[idx - 0x1] === 'S'){
            stateTracker.push('W'); // Push 'W'
          } else {
            stateTracker.push('S'); // Push 'S'
          }
        }
      } else { // If the current state in the tracker is 'W'
        stateTracker.push(stateTracker[idx - 0x1]); // Push the previous state
      }
    }
  }

  // Perform a final check and output the result
  if(stateTracker[sequenceLength] === initialState){
    stateTracker.pop(); // Remove the last element as it's an extra
    displayResult(stateTracker.join('')); // Join the states and display
  } else {
    displayResult(-0x1); // Display -1 if the condition is not met
  }
}
