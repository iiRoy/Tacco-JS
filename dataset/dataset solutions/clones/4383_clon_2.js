const fileSystemModule = require("fs");
ProcessInputData(fileSystemModule.readFileSync("/dev/stdin", "utf-8"));

function ProcessInputData(rawInputContent) {
  // Split the entire input string into an array of lines
  rawInputContent = rawInputContent.split("\n");

  // Parse the first line to get the initial array size (though not directly used later)
  const initialArraySize = parseInt(rawInputContent[0], 10);

  // Take the second line, split it by spaces, and convert elements to integers
  let integerArray = rawInputContent[1].split(" ");
  integerArray = integerArray.map(function(elementString) {
    // Convert each string element to an integer
    return parseInt(elementString, 10);
  });

  // Initialize a variable to store the maximum sum found
  let maximumAdjacentSum = 0;

  // Iterate through each number in the processed integer array
  for (let currentIndex in integerArray) {
    // Calculate the sum of occurrences for (current element - 1), current element, and (current element + 1)
    const currentAdjacentSum = calculateOccurrences(integerArray, integerArray[currentIndex] - 1) +
                               calculateOccurrences(integerArray, integerArray[currentIndex]) +
                               calculateOccurrences(integerArray, integerArray[currentIndex] + 1);

    // If the current sum is greater than the previously recorded maximum, update the maximum
    if (maximumAdjacentSum < currentAdjacentSum) {
      maximumAdjacentSum = currentAdjacentSum;
    }
  }

  // Output the final maximum adjacent sum to the console
  console.log(maximumAdjacentSum);
}

// Function to count occurrences of a specific number within an array
function calculateOccurrences(dataCollection, targetValue) {
  let occurrenceCounter = 0; // Initialize counter for occurrences
  // Loop through each element in the provided data collection
  for (let loopIndex = 0; loopIndex < dataCollection.length; loopIndex++) {
    // If the current element matches the target value, increment the counter
    if (dataCollection[loopIndex] === targetValue) {
      occurrenceCounter++;
    }
  }
  // Return the total count of the target value
  return occurrenceCounter;
}