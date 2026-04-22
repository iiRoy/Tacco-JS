"use strict"; // Enforce strict mode for better code quality

// Initiate the primary data processing flow by reading from standard input.
// The file system module is used to synchronously read the entire content
// of /dev/stdin, interpreting it as UTF-8 encoded text.
processInputData(
  require("fs")
    .readFileSync(
      "/dev/stdin", // Path to standard input device
      "UTF-8"       // Character encoding for the input stream
    )
);


// This function serves as the central entry point for processing the raw input string.
// It parses numeric data, performs calculations, and outputs the final result.
function processInputData(
  streamContent // The entire raw text content read from the input stream
) {
  // First, segment the incoming text into individual lines based on newline characters.
  streamContent = streamContent.split("\n");


  // Extract the first piece of information: the total count of items.
  // This is expected to be the first line of the input, parsed as an integer.
  const totalItems = parseInt(
    streamContent[0] // Accessing the first line
  );

  // Initialize a variable to accumulate the result of our calculations.
  // It starts at zero and will be incremented based on pairwise products.
  let aggregateValue = 0;


  // Retrieve the second line of input, which contains a space-separated list of numeric values.
  let elementScores = streamContent[1];

  // Process this line: split it into individual strings, then convert each string
  // into an integer. The resulting array will hold the numeric scores for each item.
  elementScores = elementScores
    .split(" ") // Split by space to get individual score strings
    .map((itemScore) => // Iterate over each string
      parseInt(
        itemScore // Convert current string to an integer
      )
    );


  // Begin a nested loop structure to iterate through all unique pairs of items.
  // The outer loop's index 'leftIndex' goes from the first item up to the second-to-last item.
  for (
    let leftIndex = 0;
    leftIndex < totalItems - 1;
    leftIndex++
  ) {
    // The inner loop's index 'rightIndex' starts one position after 'leftIndex'
    // to ensure we only consider distinct pairs and avoid redundant calculations (e.g., A*B is same as B*A).
    // It continues until the last item.
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < totalItems;
      rightIndex++
    ) {
      // For each unique pair, multiply their respective scores and add the product
      // to our running total 'aggregateValue'.
      aggregateValue +=
        elementScores[leftIndex] * elementScores[rightIndex];
    }
  }

  // After processing all pairs, display the final computed aggregate value to the console.
  console.log(
    aggregateValue // The accumulated sum of pairwise products
  );
}