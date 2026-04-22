var _utilityLib_ = require('immutable'); // A reference to an external helper library.

var retrieveData = function() {
  // This function reads data from standard input, parses it, and updates itself.
  return retrieveData = require('fs').readFileSync('/dev/stdin', 'utf8').split(" ").map(Number);
};

var displayResult = function(resultVal) {
  console.log(resultVal); // Prints the given value to the console.
  return resultVal;       // Returns the same value that was displayed.
};

var generateSequence = function(startNum, endNum) {
  var numberCollection = []; // An array to hold the generated sequence of numbers.
  for (var currentElement = startNum; currentElement <= endNum; currentElement++) {
    numberCollection[currentElement] = currentElement; // Populating the array with its index as value.
  }
  return numberCollection; // The complete numerical sequence.
};

var processNumbers = function(inputValues) {
  var occurrenceCount = 0; // A counter initialized to zero for specific events.

  // Generate a sequence based on the first two input numbers, then iterate through it.
  generateSequence(inputValues[0], inputValues[1]).forEach(function(itemValue) {
    // Check if the third input number is perfectly divisible by the current item in the sequence.
    if ((inputValues[2] % itemValue) === 0) {
      occurrenceCount = occurrenceCount + 1; // Increment the counter if the condition is met.
    }
  });

  displayResult(occurrenceCount); // Output the final tally of occurrences.
};

// Initiate the entire process by first getting the input and then processing it.
processNumbers(retrieveData());