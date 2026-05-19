const outputFunc = console.log;

// Check if running in a Node.js-like environment for input processing
if (typeof process !== "undefined") {
  let receivedData = ""; // Accumulates all incoming data
  process.stdin.resume(); // Keep the process alive
  process.stdin.setEncoding('utf8'); // Set encoding for input stream

  // Event listener for data chunks
  process.stdin.on('data', function (dataSegment) {
    receivedData += dataSegment; // Append new data to the buffer
  });

  // Event listener for end of input
  process.stdin.on('end', function () {
    const inputLines = receivedData.split("\n"); // Split accumulated data into lines
    processInput(inputLines); // Call the main processing function
  });
}

// Main function to handle the input data
function processInput(inputRows) {
  // Transform input rows: convert space-separated numbers or single numbers
  inputRows = inputRows.map(function (element) {
    if (element.split(" ").length >= 2) {
      // If multiple numbers, split and convert all to Number
      return element.split(" ").map(function (item) {
        return Number(item);
      });
    } else {
      // If a single number, convert directly
      return Number(element);
    }
  });

  // Process datasets until no more input rows are left
  while (inputRows.length > 0) {
    const currentLine = inputRows.shift(); // Get the first line of the current dataset
    const numbersInLine = currentLine; // This line contains N and M

    const heightCount = numbersInLine[0]; // First number is N (height count)
    const widthCount = numbersInLine[1]; // Second number is M (width count)

    // Termination condition for input processing
    if (heightCount === 0 && widthCount === 0) {
      return; // Exit the function if N and M are both zero
    } else {
      // Extract height and width values for the current dataset
      const heightValues = inputRows.splice(0, heightCount); // N lines for heights
      const widthValues = inputRows.splice(0, widthCount); // M lines for widths
      processDataset(heightValues, widthValues); // Process the extracted dataset
    }
  }
}

// Function to process a single dataset (H and W arrays)
function processDataset(heightData, widthData) {
  // Calculate frequencies of all possible sums for height segments
  const heightSums = calculateSums(heightData);
  // Calculate frequencies of all possible sums for width segments
  const widthSums = calculateSums(widthData);

  // Count intersections of sums between height and width segments
  const intersectionCount = countIntersections(heightSums, widthSums);
  outputFunc(intersectionCount); // Output the final count
}

// Calculates all possible contiguous subarray sums and their frequencies
function calculateSums(inputArray) {
  const arrayLength = inputArray.length;
  const sumFrequencies = {}; // Stores sum -> frequency mapping

  // Iterate through all possible starting points
  for (let outerIndex = 0; outerIndex < arrayLength; outerIndex++) {
    let currentSum = 0; // Initialize sum for the current segment

    // Iterate through all possible ending points from the current starting point
    for (let innerIndex = outerIndex + 1; innerIndex <= arrayLength; innerIndex++) {
      currentSum += inputArray[innerIndex - 1]; // Add the next element to the current sum

      // Update frequency for the current sum
      if (!sumFrequencies[currentSum]) {
        sumFrequencies[currentSum] = 1; // First occurrence
      } else {
        sumFrequencies[currentSum]++; // Increment count
      }
    }
  }
  return sumFrequencies; // Return the map of sums and their frequencies
}

// Counts the total intersections of sums between two frequency maps
function countIntersections(firstMap, secondMap) {
  let totalCount = 0; // Initialize total intersection count

  // Iterate over keys (sums) in the first map
  for (const keyVal in firstMap) {
    // If the sum also exists in the second map
    if (!!secondMap[keyVal]) {
      // Multiply their frequencies and add to total count
      totalCount += firstMap[keyVal] * secondMap[keyVal];
    }
  }
  return totalCount; // Return the final count of intersections
}
