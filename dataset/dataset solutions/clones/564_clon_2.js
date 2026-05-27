function computeMaxWindowSum(dataArray, windowSize) {
  // This array will store the sum of each sliding window
  let windowSums = [];

  // Iterate through the array to calculate sums for all possible windows
  // The loop runs until there's enough elements left for a full window
  for (let idx = 0; idx <= dataArray.length - windowSize; idx++) {
    let currentSum = 0; // Initialize sum for the current window
    let counter = windowSize; // Counter for elements within the window

    // Special handling for the first window
    if (idx === 0) {
      // Calculate the sum of the first window by iterating through its elements
      while (counter > 0) {
        currentSum += dataArray[idx + counter - 1]; // Sum elements from the end of the window
        counter--;
      }
    } else {
      // For subsequent windows, use a sliding window optimization
      // Subtract the element leaving the window and add the new element entering
      currentSum = windowSums[idx - 1] - dataArray[idx - 1] + dataArray[idx + windowSize - 1];
    }
    // Add the calculated sum to our collection of window sums
    windowSums.push(currentSum);
  }

  // Sort the collected window sums in descending order to find the maximum
  windowSums.sort(function(valB, valA) {
    return valA - valB; // Sort from largest to smallest
  });

  // Output the largest sum found
  console.log(windowSums[0]);
}

// Read input from standard input
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into lines
const lineEntries = (fileContent.trim()).split("\n");

let currentNumbers = []; // Stores numbers for the current set
let currentWindowLength = 0; // Stores the window length for the current set

// Iterate over each line of the input
for (let lineIndex = 0; lineIndex < lineEntries.length; lineIndex++) {
  // Parse the line: split by space and convert to numbers
  const parsedLine = lineEntries[lineIndex].split(" ").map(Number);

  // Check if the line indicates a new set of numbers or the end of input
  if (parsedLine.length === 2 || lineIndex === lineEntries.length - 1) {
    // If it's not the very first set, process the previous set
    if (lineIndex !== 0) {
      computeMaxWindowSum(currentNumbers, currentWindowLength);
    }
    // Initialize for the new set
    currentNumbers = [];
    currentWindowLength = parsedLine[1]; // The second number is the window length
  } else {
    // If it's a number line, add it to the current set of numbers
    currentNumbers.push(parsedLine[0]);
  }

  // Check for the termination condition "0 0"
  if (lineEntries[lineIndex] === "0 0") {
    break; // Exit the loop if "0 0" is encountered
  }
}
