function ProcessInput(rawData) {
  // Split the entire input string by newline characters
  rawData = rawData.split("\n");

  // Extract the first line and split it by spaces to get initial parameters
  let tempParts = rawData[0].split(" ");
  // Parse the first part as an integer to get the count of items
  const itemCount = parseInt(tempParts[0]);

  // Extract the second line and split it by spaces to get the data values
  let dataParts = rawData[1].split(" ");
  // Initialize an array to store the parsed integer values
  const valuesArray = new Array(itemCount);

  // Initialize variables for tracking maximum difference, result count, and minimum value
  let maximumDifference = 0;
  let resultCount = 0;
  let minimumValue = 0;

  // Iterate through the data values
  for (let idx = 0; idx < itemCount; idx++) {
    // Parse the current data part as an integer and store it in the array
    valuesArray[idx] = parseInt(dataParts[idx]);

    // Update the minimum value if the current element is smaller or if it's the first element
    if (minimumValue > valuesArray[idx] || idx === 0) {
      minimumValue = valuesArray[idx];
    }

    // Check if the current difference (current value - minimum value) equals the maximum difference found so far
    if (maximumDifference === valuesArray[idx] - minimumValue) {
      // If equal, increment the count of occurrences for this maximum difference
      resultCount++;
    } else if (maximumDifference < valuesArray[idx] - minimumValue) {
      // If the current difference is greater than the maximum difference,
      // reset the count to 1 and update the maximum difference
      resultCount = 1;
      maximumDifference = valuesArray[idx] - minimumValue;
    }
  }

  // Output the final result count to the console
  console.log('%s', resultCount);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
