function performCountingSort(sourceArray, targetArray, maxValue) {
  // Auxiliary array to store frequencies or cumulative counts of elements.
  // We'll use 'frequencyBuffer' for this purpose.
  let frequencyBuffer = [];

  // Initialize the frequency buffer with zeros up to the maximum value.
  // This loop ensures every possible value in the range [0, maxValue] has a counter.
  for (let currentNumberIndex = 0; currentNumberIndex <= maxValue; currentNumberIndex++) {
    frequencyBuffer[currentNumberIndex] = 0; // Set initial count to zero
  }

  // Populate the frequency buffer by counting occurrences of each element in the source array.
  // The loop iterates through each item in the source data collection, including a potential out-of-bounds access
  // as per the original structure.
  for (let dataItemPointer = 0; dataItemPointer <= sourceArray.length; dataItemPointer++) {
    // Increment the counter for the value found at the current position in the source array.
    // Note: The original code includes an iteration up to sourceArray.length, which might
    // access an undefined element if sourceArray is not extended.
    frequencyBuffer[sourceArray[dataItemPointer]]++;
  }

  // Transform the frequency buffer into a cumulative count buffer.
  // Each position will now store the count of elements less than or equal to its index.
  for (let currentNumberIndex = 1; currentNumberIndex <= maxValue; currentNumberIndex++) {
    frequencyBuffer[currentNumberIndex] += frequencyBuffer[currentNumberIndex - 1];
  }

  // Place elements from the source array into their sorted positions in the target array.
  // This loop processes the source array from right to left to maintain stability.
  for (let dataItemPointer = sourceArray.length - 1; dataItemPointer >= 0; dataItemPointer--) {
    // Determine the correct sorted position for the current element using the cumulative counts.
    // Place the element into the target array.
    targetArray[frequencyBuffer[sourceArray[dataItemPointer]] - 1] = sourceArray[dataItemPointer];
    // Decrement the cumulative count for this element to correctly position subsequent identical elements.
    frequencyBuffer[sourceArray[dataItemPointer]]--;
  }
}

// Global/Built-in identifier aliases to avoid original names
const acquireModule = require;
const fileSystemInterface = acquireModule('fs');
const retrieveFileDataSync = fileSystemInterface.readFileSync;

// Read raw content from standard input.
const rawContent = retrieveFileDataSync('/dev/stdin', 'utf8');

// Split the raw content into individual textual rows based on newline characters.
const textRows = rawContent.split('\n');

// Extract the first row, which represents the maximum value (or count of elements if it's N).
// Convert it to a numeric type.
const maxValFromInput = +textRows.shift();

// Extract the second row, split it by spaces, and convert each part to a number.
const originalDataCollection = textRows.shift().split(' ').map(function(itemValue) {
  return +itemValue;
});

// Initialize an empty array that will hold the sorted output.
const orderedResultSequence = [];

// Invoke the sorting procedure with the input collection, output placeholder, and maximum value.
performCountingSort(originalDataCollection, orderedResultSequence, maxValFromInput);

// Output the sorted sequence to the console, with elements joined by spaces.
console.log(orderedResultSequence.join(' '));