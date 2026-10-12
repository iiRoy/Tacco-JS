// This function processes the given input string to find a specific pattern.
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines based on newline characters.
  rawData = rawData.split("\n");

  // Extract the first line, which contains the count of elements, and split it by space.
  let tempParts = rawData[0].split(" ");

  // Parse the first part of the temporary array as an integer to determine the number of data elements.
  const countElements = parseInt(tempParts[0], 10);

  // Initialize a new array of the determined size, filling all its elements with zero.
  let dataArray = new Array(countElements).fill(0);

  // Declare and initialize variables to track the minimum value encountered,
  // the maximum difference found so far, and the count of occurrences for that maximum difference.
  let minimumValue = 1000000000; // Start with a very large number for minimum to ensure the first element updates it.
  let maximumDifference = 0;
  let resultCount = 0;

  // Iterate through each element of the data array.
  for (let idx = 0; idx < countElements; idx++) {
    // Parse the current data element from the second line of the input, splitting by space.
    dataArray[idx] = parseInt(rawData[1].split(" ")[idx], 10);

    // If the current element is smaller than the recorded minimum value, update the minimum.
    if (minimumValue > dataArray[idx]) {
      minimumValue = dataArray[idx];
    }

    // Calculate the difference between the current element and the current minimum value.
    // Compare this difference with the stored maximum difference.
    if (maximumDifference === dataArray[idx] - minimumValue) {
      // If the current difference is equal to the maximum difference, increment the result counter.
      resultCount++;
    } else if (maximumDifference < dataArray[idx] - minimumValue) {
      // If the current difference is greater than the maximum difference,
      // it means a new maximum difference has been found.
      // Reset the result counter to 1 (for this new maximum) and update the maximum difference.
      resultCount = 1;
      maximumDifference = dataArray[idx] - minimumValue;
    }
  }

  // Output the final calculated result count to the console.
  console.log('%s', resultCount);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
