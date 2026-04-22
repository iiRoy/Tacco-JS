"use strict" // Enforce stricter parsing and error handling in the code.

// Function to initialize an input stream handler.
const makeInputReader = () => {
  // Read all input from standard input, decode as UTF-8, trim whitespace, and split into lines.
  const linesData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

  // Create an object to manage reading from the input lines.
  const dataIterator = {
    contentArray: linesData, // Stores all input lines.
    currentPosition: 0,      // Current index in the contentArray.
    totalElements: linesData.length, // Total number of lines.

    // Checks if there are more lines to read.
    hasMore: function() {
      return this.currentPosition < this.totalElements;
    },

    // Retrieves the next line from the input.
    retrieveNext: function() {
      if (!this.hasMore()) {
        throw "ArrayIndexOutOfBoundsException"; // Indicate end of input.
      } else {
        return this.contentArray[this.currentPosition++]; // Return current line and advance position.
      }
    }
  };
  return dataIterator; // Return the configured input handler.
};

// Instantiate the input stream processor.
const inputStream = makeInputReader();

// Helper functions for convenient input parsing.
const fetchNextString = () => inputStream.retrieveNext(); // Gets the next line as a string.
const parseNextInteger = () => parseInt(inputStream.retrieveNext()); // Parses the next line as an integer.
const fetchNextStringArray = () => inputStream.retrieveNext().split(" "); // Gets the next line and splits it into an array of strings.
const parseNextIntegerArray = () => inputStream.retrieveNext().split(" ").map(item => parseInt(item)); // Gets the next line, splits, and maps to integers.
const fetchNextCharacterArray = () => inputStream.retrieveNext().split(""); // Gets the next line and splits into an array of characters.
const checkIfMoreInput = () => inputStream.hasMore(); // Checks if more input is available.

// Custom output function, using console.log.
const outputToConsole = (...valuesToLog) => console.log(...valuesToLog);

// The primary execution logic of the program.
const executeMainLogic = () => {
  // Read the initial count of numbers.
  const elementCount = parseNextInteger();
  // Read the initial array of numbers.
  const initialNumbers = parseNextIntegerArray();

  // Create a frequency map to store counts of each number.
  let frequencyMap = {};
  for (let currentNum of initialNumbers) {
    if (!frequencyMap[currentNum]) {
      frequencyMap[currentNum] = 1; // Initialize count if number not seen before.
    } else {
      frequencyMap[currentNum]++; // Increment count if number already exists.
    }
  }

  // Read the number of queries.
  const queryCount = parseNextInteger();
  // Arrays to store 'from' and 'to' values for each query.
  let sourceValues = [];
  let targetValues = [];

  // Read all query pairs (b, c) until no more input.
  while (checkIfMoreInput()) {
    let [sourceVal, targetVal] = parseNextIntegerArray(); // Destructure the pair.
    sourceValues.push(sourceVal); // Add 'from' value.
    targetValues.push(targetVal); // Add 'to' value.
  }

  // Calculate the initial sum based on the frequency map.
  let currentTotalSum = 0;
  for (let mapEntryKey of Object.keys(frequencyMap)) {
    // Note: mapEntryKey is a string, convert to number for multiplication.
    currentTotalSum = currentTotalSum + frequencyMap[mapEntryKey] * Number(mapEntryKey);
  }

  // Process each query.
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    let valToChange = sourceValues[queryIndex]; // The number to be replaced.
    let newVal = targetValues[queryIndex];     // The number it will be replaced with.

    // Scenario 1: Both 'from' and 'to' values exist in the map.
    if (frequencyMap[valToChange] && frequencyMap[newVal]) {
      // Update sum: subtract old value contribution, add new value contribution.
      currentTotalSum = currentTotalSum - frequencyMap[valToChange] * valToChange + frequencyMap[valToChange] * newVal;
      // Merge counts: add 'from' count to 'to' count.
      frequencyMap[newVal] = frequencyMap[newVal] + frequencyMap[valToChange];
      // Set 'from' count to zero as it's effectively removed.
      frequencyMap[valToChange] = 0;
    }
    // Scenario 2: 'from' value exists, but 'to' value does not.
    else if (frequencyMap[valToChange] && !frequencyMap[newVal]) {
      // Update sum similarly.
      currentTotalSum = currentTotalSum - frequencyMap[valToChange] * valToChange + frequencyMap[valToChange] * newVal;
      // Assign 'from' count to 'to' count (effectively renaming 'from' to 'to').
      frequencyMap[newVal] = frequencyMap[valToChange];
      // Set 'from' count to zero.
      frequencyMap[valToChange] = 0;
    }
    // Output the updated total sum after each query.
    outputToConsole(currentTotalSum);
  }
};

// Begin program execution.
executeMainLogic();