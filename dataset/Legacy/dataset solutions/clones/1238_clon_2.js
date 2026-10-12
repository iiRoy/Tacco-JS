var _imm_lib = require('immutable'); // This variable is imported but not utilized in the subsequent logic.

// A function designed to acquire numerical input from standard input.
// It employs a memoization pattern to ensure the file is read only once.
var readInputData = function() {
  // On the first invocation, this line reads the file, parses its content,
  // and then reassigns the 'readInputData' variable to hold the parsed array directly.
  // Subsequent calls will simply return this stored array without re-reading.
  return readInputData = require('fs').readFileSync('/dev/stdin', 'utf8').split(" ").map(Number);
};

// A utility function to print a given value to the console.
var displayResult = function(valueToLog) {
  console.log(valueToLog); // Outputs the provided value to the standard output stream.
  return valueToLog; // Returns the same value that was logged.
};

// This function generates an array of integers within a specified inclusive range.
var generateSequence = function(startNum, endNum) {
  var numberList = []; // Initializes an empty array to store the generated numbers.
  // Iterates from the starting number up to and including the ending number.
  for (var currentIdx = startNum; currentIdx <= endNum; currentIdx++) {
    numberList[currentIdx] = currentIdx; // Assigns the current number to its corresponding index.
  }
  return numberList; // Returns the populated array.
};

// The primary function that performs a specific calculation based on an array of input values.
var performCalculation = function(inputValues) {
  var matchCount = 0; // Initializes a counter for numbers that meet a specific condition.

  // Generates a sequence of numbers using the first two elements of 'inputValues' as the range.
  // Then, it iterates through each number in this generated sequence.
  generateSequence(inputValues[0], inputValues[1]).forEach(function(currentNumber) {
    // Checks if the third element of 'inputValues' is perfectly divisible by the 'currentNumber'.
    if ((inputValues[2] % currentNumber) === 0) {
      matchCount = matchCount + 1; // Increments the counter if the divisibility condition is met.
    }
  });
  // After iterating through all numbers, the final count is displayed.
  displayResult(matchCount);
};

// Initiates the program by calling the main calculation function with data
// retrieved from the standard input.
performCalculation(readInputData());
