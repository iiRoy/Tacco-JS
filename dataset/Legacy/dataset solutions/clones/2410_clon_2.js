// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
  // Extract the total number of elements from the first line of input.
  const countElements = parseInt(rawData[0], 10);

  // Parse the second line of input, splitting it into an array of string representations of numbers.
  let dataArray = rawData[1].split(" ");

  // Initialize a variable to accumulate the sum of all numeric values.
  let sumAll = 0;

  // Iterate through the array to convert each string element to an integer and compute the grand total.
  for (let idx = 0; idx < countElements; idx++) {
    dataArray[idx] = parseInt(dataArray[idx], 10); // Convert current element to integer.
    sumAll += dataArray[idx]; // Add to the running total.
  }

  // console.log("Total sum of all elements: %s", sumAll); // Debugging line for total sum.

  // Initialize variables for the partitioning logic.
  let finalOutcome = 0;     // Stores the final calculated result.
  let leftSum = 0;          // Accumulates the sum of elements on the 'left' side of a conceptual split.
  let rightSum = 0;         // Accumulates the sum of elements on the 'right' side.
  let splitIndex = 0;       // Records the index where the array is effectively partitioned.

  // Loop through the array to determine the optimal split point.
  for (let idx = 0; idx < countElements; idx++) {
    // If adding the current element keeps the left sum less than half of the total sum.
    if (leftSum + dataArray[idx] < sumAll / 2) {
      leftSum += dataArray[idx]; // Include the current element in the left sum.
    }
    // If adding the current element makes the left sum exactly half of the total sum.
    else if (leftSum + dataArray[idx] === sumAll / 2) {
      console.log("%s", 0); // A perfect split is found, output 0 and terminate.
      return;
    }
    // If adding the current element causes the left sum to exceed half of the total sum.
    else {
      splitIndex = idx; // This index is the critical point for the split.
      // Calculate the right sum by subtracting the current left sum and the element at the split index from the total.
      rightSum = sumAll - leftSum - dataArray[idx];
      break; // Exit the loop as the split point has been identified.
    }
  }

  // console.log("Accumulated left partition sum: %s", leftSum);
  // console.log("Accumulated right partition sum: %s", rightSum);
  // console.log("Determined split point index: %s", splitIndex);
  // console.log("Value at the split point: %s", dataArray[splitIndex]);

  // Compute the absolute difference between the left and right partition sums.
  const difference = Math.abs(rightSum - leftSum);

  // console.log("Absolute difference between partition sums: %s", difference);

  // Calculate the final result: the absolute difference between the element at the split index and the computed difference.
  finalOutcome = Math.abs(dataArray[splitIndex] - difference);
  console.log("%s", finalOutcome); // Output the final calculated value.
}

// Invoke the main processing function with input read from standard input.
ProcessInput(
  require("fs")
    .readFileSync("/dev/stdin", "utf8") // Read the entire content of stdin as a UTF-8 string.
    .split("\n") // Split the content into an array of strings, one for each line.
);
