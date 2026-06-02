'use strict';

/*
 * This module handles the primary logic for processing input data.
 * Please do not modify the subsequent lines that manage standard I/O.
 */
function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  rawData = rawData.split("\n");

  // The first line contains a single number, split by space (though only one element).
  let firstLineParts = rawData[0].split(" ");

  // The second line contains multiple numbers, also split by spaces.
  let secondLineElements = rawData[1].split(" ");

  // Parse the first number from the first line as the comparison target.
  let targetValue = parseInt(firstLineParts[0], 10); // Explicitly use base 10

  // Initialize an accumulator for the sum of numbers from the second line.
  let totalAccumulator = 0;

  // Iterate through each element in the second line.
  for (let idx = 0; idx < secondLineElements.length; idx++) {
    // Convert each string element to an integer and add it to the total.
    totalAccumulator += parseInt(secondLineElements[idx], 10); // Explicitly use base 10
  }

  // Compare the calculated total with the target value.
  if (totalAccumulator >= targetValue) {
    // If the total is greater than or equal to the target, print "Yes".
    console.log("Yes");
  } else {
    // Otherwise, print "No".
    console.log("No");
  }
}

// The following line reads input from standard input and invokes the main processing function.
// It should not be altered to ensure proper execution in the given environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
