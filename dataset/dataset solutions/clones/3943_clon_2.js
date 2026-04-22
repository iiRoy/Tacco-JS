/* This module handles retrieving raw input from standard input stream. */
function acquireSystemInput()
{
  return require("fs").readFileSync("/dev/stdin", "utf8").trim() ;
}

// Conversion codes:
// 0: Return as is
// 1: Convert to integer
// 2: Split by space character
// 3: Split by newline character
// 4: Split by space, then convert each part to number
// 5: Split by newline, then convert each part to number
// 6: Split into individual characters
// 7: Split into individual characters, then convert each to number
function processDataFormat(dataChunk, formatCode)
{
  switch(formatCode)
  {
    case 0:
      return dataChunk;
    case 1:
      return parseInt(dataChunk);
    case 2:
      return dataChunk.split(" ");
    case 3:
      return dataChunk.split("\n");
    case 4:
      return dataChunk.split(" ").map( (itemVal) => Number(itemVal) );
    case 5:
      return dataChunk.split("\n").map( (itemVal) => Number(itemVal) );
    case 6:
      return dataChunk.split("");
    case 7:
      return dataChunk.split("").map( (itemVal) => Number(itemVal) );
  }
}

// The primary execution function for the algorithm.
function performCoreOperation(initialPayload) {
  // First, split the entire payload by newline characters.
  let currentDataSet = processDataFormat(initialPayload, 3);

  // Extract the number of iterations from the first line, converting it to an integer.
  const numIterations = processDataFormat(currentDataSet[0], 1);

  // Extract the maximum threshold 'D' from the second line (first part).
  const maxThreshold = processDataFormat(currentDataSet[1], 4)[0];

  // Extract the initial offset 'X' from the second line (second part).
  const initialValue = processDataFormat(currentDataSet[1], 4)[1];

  let computedSum = 0; // Initialize the accumulating result.

  // Remove the first two processed lines from the dataset.
  currentDataSet.shift();
  currentDataSet.shift();

  // Convert all remaining elements in the dataset to numerical values.
  currentDataSet = currentDataSet.map( (elem) => Number(elem) );

  // Iterate through each element in the modified dataset 'numIterations' times.
  for (let idxCounter = 0; idxCounter < numIterations; idxCounter++)
  {
    let loopAccumulator = 1; // Start the internal counter at 1.
    while (loopAccumulator <= maxThreshold) // Continue as long as the accumulator is within the threshold.
    {
      computedSum++; // Increment the total computed sum.
      loopAccumulator += currentDataSet[idxCounter]; // Add the current dataset element to the accumulator.
    }
  }

  // Output the final computed sum, augmented by the initial offset value.
  console.log(computedSum + initialValue);
}

// Initiate the entire process by fetching input and passing it to the main logic.
performCoreOperation(acquireSystemInput());