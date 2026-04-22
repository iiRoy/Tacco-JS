"use strict";
/* This directive enforces stricter parsing and error handling on the code. */

function calculateOptimalPath( /* This function computes the minimal total path. */
  incomingRawData
) {
  // The following block processes the input string.
  // It splits by newline, then each line by space,
  // and finally converts each segment into an integer.
  let processedNumericArrays = incomingRawData
    .split(
      /\n/
    )
    .map(
      (
        lineSegment
      ) =>
        lineSegment.split(" ")
          .map(
            (
              itemValueString
            ) =>
              Number.parseInt(itemValueString, 10) // Explicitly parse to integer.
          )
    );

  const elementQuantity = processedNumericArrays[0][0]; // Extract the count of items.
  const targetValue = processedNumericArrays[1][0]; // Extract the specific target point.
  const positionSet = processedNumericArrays[2]; // Retrieve the array of positions.

  let totalSum = 0; // Initialize the accumulator for the path length.

  // Iterate through each position to determine the shortest path contribution.
  for (let currentIdx = 0; currentIdx < elementQuantity; currentIdx++) {
    // For each position, calculate the distance to origin (0) and to the target value (K).
    // The shorter of these two distances is added to the total sum.
    totalSum += positionSet[currentIdx] < Math.abs(positionSet[currentIdx] - targetValue) ? positionSet[currentIdx] : Math.abs(positionSet[currentIdx] - targetValue);
  }

  // The problem implies a return trip, so the total sum is doubled.
  totalSum *= 2;

  // Output the final calculated result to the console.
  console.log(totalSum);
}

// This section reads the input from standard input and then invokes the main processing function.
calculateOptimalPath(
  require("fs")
    .readFileSync(
      "/dev/stdin",
      "utf8"
    )
);