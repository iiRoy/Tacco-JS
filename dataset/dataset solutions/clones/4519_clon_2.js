var finalResult; // Variable to store the ultimate outcome
var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); // Read input from stdin, clean it, and split by newlines

// An object to manage iteration over the input data
var dataProcessor = {
  "dataItems" : rawData, // The collection of input lines
  "currentPosition" : 0, // Current index for iteration
  "totalItems" : rawData.length, // Total number of items in the collection
  // Method to retrieve the next item from the collection
  "fetchNextItem" : function(){
    // Check if there are more items to process
    if(!this.hasMoreItems()){
      throw new Error("NoSuchElementException: No more elements available for processing."); // Indicate an error if no more items
    }
    var retrievedItem = this.dataItems[this.currentPosition]; // Get the item at the current position
    this.currentPosition++; // Advance the position for the next call
    return retrievedItem; // Return the fetched item
  },
  // Method to check if there are more items to process
  "hasMoreItems" : function(){
    return (this.currentPosition < this.totalItems); // True if current position is within bounds
  }
};

executePrimaryLogic(); // Begin the main program execution

// Helper function to get the next item using the data processor
function retrieveNextElement(){
  return dataProcessor.fetchNextItem();
}

// Helper function to check if more items are available using the data processor
function checkIfMoreElements(){
  return dataProcessor.hasMoreItems();
}

// Function for standard output
function displayResult(valueToPrint){
  console.log(valueToPrint);
}

// Function for standard error output
function reportError(errorMessage){
  console.error(errorMessage);
}

// Function to transform input values based on a specified type number
// [no] Handling of elements. Numeric type.
// Unknown value, on error: returns the argument as is.
// 1: Convert to integer. 2: Split by half-width space. 4: Split by half-width space and convert to number array.
// 6: Split into individual characters. 7: Split into individual characters and convert to number array.
// 8: Join with half-width space. 9: Join with newline. 0: Join without any character.
function transformValue(inputValue, transformationType){
  try {
    switch(transformationType){
      case 1: return parseInt(inputValue, 10); // Parse as integer
      case 2: return inputValue.split(" "); // Split by space
      case 4: return inputValue.split(" ").map((element) => Number(element)); // Split and map to numbers
      case 6: return inputValue.split(""); // Split into characters
      case 7: return inputValue.split("").map((element) => Number(element)); // Split into characters and map to numbers
      case 8: return inputValue.join(" "); // Join array with space
      case 9: return inputValue.join("\n"); // Join array with newline
      case 0: return inputValue.join(""); // Join array without separator
      default: return inputValue; // Default: return as is
    }
  } catch(error){
    return inputValue; // On error, return original value
  }
}

// The main logic of the program
function executePrimaryLogic() {
  var characterArray = transformValue(retrieveNextElement(), 6); // Get the input string and split it into characters
  var charOccurrences = {}; // Object to store character frequencies

  // Count occurrences of each character
  for(var idx = 0; idx < characterArray.length; idx++){
    var currentChar = characterArray[idx];
    if(charOccurrences[currentChar] === undefined){ // If character not seen before
       charOccurrences[currentChar] = 1; // Initialize count
    } else {
       charOccurrences[currentChar]++; // Increment count
    }
  }

  var unusedMaxKeys = []; // Declared but not used in the current logic path
  var unusedMaxVal = 0; // Declared but not used in the current logic path
  var distinctChars = Array.from(Object.keys(charOccurrences)); // Get unique characters from the map

  // If there's only one unique character, no operations are needed
  if(distinctChars.length === 1){
     displayResult(0); // Output 0
     return; // Exit function
  }
  
  var minOperations = 107; // Initialize minimum operations with a large value

  // Iterate through each distinct character as a potential target
  for(var kdx = 0; kdx < distinctChars.length; kdx++){
    var currentComparisonChar = distinctChars[kdx]; // The character we want to make the entire sequence
    var workingCharSequence = Object.assign([], characterArray); // Create a mutable copy of the original sequence
    var operationCounter = 0; // Counter for operations for the current target character

    // Loop until the sequence is uniform with the target character
    while(!verifyUniformity(workingCharSequence, currentComparisonChar)){
      // Iterate through the sequence to perform operations
      for(var idx = 0; idx < workingCharSequence.length; idx++){
        // If the next character is the target, propagate it backward
        if(workingCharSequence[idx + 1] === currentComparisonChar){
           workingCharSequence[idx] = currentComparisonChar;
        }
      }
      workingCharSequence.pop(); // Remove the last element
      operationCounter++; // Increment operation count
    }
    minOperations = Math.min(minOperations, operationCounter); // Update minimum operations found
  }
  displayResult(minOperations); // Output the final minimum operations
}

// Function to check if all characters in a sequence are identical to a target character
function verifyUniformity(sequenceToCheck, targetChar){
    var isEntirelyUniform = true; // Assume uniform initially
    for(var idx = 0; idx < sequenceToCheck.length; idx++){
      if(sequenceToCheck[idx] !== targetChar){ // If any character doesn't match
         isEntirelyUniform = false; // It's not uniform
         break; // No need to check further
      }
    }
    return isEntirelyUniform; // Return the uniformity status
}
