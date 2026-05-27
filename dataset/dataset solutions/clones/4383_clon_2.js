var fileSystemModule = require("fs"); // Import the Node.js file system module for file operations.

// Read the entire content from standard input (stdin) as a UTF-8 string,
// then pass this raw string data to the primary processing function.
ProcessInput(fileSystemModule.readFileSync("/dev/stdin", "utf-8"));

/**
 * This function serves as the main entry point for processing the input data.
 * It parses numerical values, performs calculations, and outputs the result.
 * @param {string} rawData - The complete raw string content read from the input source.
 */
function ProcessInput(rawData) {
  // First, split the raw input string into an array of lines based on newline characters.
  rawData = rawData.split("\n");

  // Parse the first line of the input to determine the size of the array.
  // This variable is globally scoped, mirroring the original code's behavior.
  arraySize = parseInt(rawData[0], 10);

  // Process the second line of the input:
  // 1. Split it by spaces to get individual string representations of numbers.
  // 2. Use the map function to convert each string representation into an actual integer.
  var numArray = rawData[1].split(" ");
  numArray = numArray.map(function(itemVal) {
    return parseInt(itemVal, 10);
  });

  // Initialize a variable to keep track of the maximum sum of occurrences found so far.
  var maxCount = 0;

  // Iterate over each element in the processed number array using a for...in loop.
  // The 'idx' variable will hold the index of the current element.
  for (var idx in numArray) {
    // For the current number (numArray[idx]), calculate the sum of occurrences for:
    // 1. The number immediately preceding it (numArray[idx] - 1).
    // 2. The number itself (numArray[idx]).
    // 3. The number immediately succeeding it (numArray[idx] + 1).
    var currentSum = tallyOccurrences(numArray, numArray[idx] - 1) +
                     tallyOccurrences(numArray, numArray[idx]) +
                     tallyOccurrences(numArray, numArray[idx] + 1);

    // Compare the calculated 'currentSum' with the 'maxCount'.
    // If 'currentSum' is greater, update 'maxCount' to this new higher value.
    if (maxCount < currentSum) {
      maxCount = currentSum;
    }
  }

  // After iterating through all elements and finding the maximum sum, print this value to the console.
  console.log(maxCount);
}

/**
 * This helper function counts how many times a specific target value appears within a given array of numbers.
 * @param {number[]} dataList - The array of numbers in which to search for the target value.
 * @param {number} targetVal - The specific number whose occurrences need to be counted.
 * @returns {number} The total number of times 'targetVal' is found in 'dataList'.
 */
function tallyOccurrences(dataList, targetVal) {
  var occurrenceCount = 0; // Initialize a counter for the target value's occurrences.

  // Loop through each element of the 'dataList' array using a standard for loop.
  for (var k = 0; k < dataList.length; k++) {
    // Check if the current element of the array strictly equals the 'targetVal'.
    if (dataList[k] === targetVal) {
      occurrenceCount++; // If a match is found, increment the counter.
    }
  }

  return occurrenceCount; // Return the final count of occurrences.
}
