"use strict";

// This function serves as the primary entry point for processing the input data.
// It calculates a sequence of products based on a sliding window and then
// determines if each product in the sequence is greater than its predecessor.
const processInput = (inputData) => {
  // First, we clean up the raw input string by removing any leading/trailing
  // whitespace and then splitting it into an array of individual lines.
  let processedLines = inputData.trim().split("\n");

  // The first line contains two space-separated integers:
  // the total size of the number array and the size of the sliding window.
  // We parse these values. Using `Number` is a concise way to convert string to number.
  const [sizeOfArray, slidingWindow] = processedLines[0].split(" ").map(Number);

  // The second line contains the actual array of numbers, also space-separated.
  // We parse each string representation into an integer, ensuring base 10.
  const numberCollection = processedLines[1]
    .split(" ")
    .map((numStr) => parseInt(numStr, 10));

  // Initialize a variable to hold the product of the numbers within the current window.
  let currentWindowProduct = 1;
  // Initialize an array to store the calculated products for each sliding window.
  let productSeries = [];

  // Calculate the product for the very first window, which consists of the
  // first 'slidingWindow' numberCollection elements.
  for (let loopIndex = 0; loopIndex < slidingWindow; loopIndex++) {
    currentWindowProduct *= numberCollection[loopIndex];
  }

  // Add the product of this initial window to our series.
  productSeries.push(currentWindowProduct);

  // Now, iterate through the rest of the numberCollection array, starting from
  // the end of the first window, to calculate products for subsequent windows.
  // This is done efficiently using a sliding window technique:
  // divide by the element that leaves the window, then multiply by the new element entering.
  for (let loopIndex = slidingWindow; loopIndex < sizeOfArray; loopIndex++) {
    // Remove the contribution of the element that is no longer in the window.
    currentWindowProduct /= numberCollection[loopIndex - slidingWindow];
    // Add the contribution of the new element that has just entered the window.
    currentWindowProduct *= numberCollection[loopIndex];

    // Store the product of this new window configuration.
    productSeries.push(currentWindowProduct);
  }

  // Prepare an array to store the final comparison outcomes ("Yes" or "No").
  let comparisonOutcome = [];

  // Get the total number of products we have in our series.
  let seriesCount = productSeries.length;

  // Iterate through the product series, starting from the second element,
  // to compare each product with its immediate predecessor.
  for (let loopIndex = 1; loopIndex < seriesCount; loopIndex++) {
    // If the current product is less than or equal to the previous one,
    // it means the product did not strictly increase.
    if (productSeries[loopIndex] <= productSeries[loopIndex - 1]) {
      comparisonOutcome.push("No");
    } else {
      // Otherwise, if the current product is strictly greater, it's a "Yes".
      comparisonOutcome.push("Yes");
    }
  }

  // Finally, print all the comparison outcomes, with each outcome on a new line.
  console.log(comparisonOutcome.join("\n"));
};

// The program starts by reading the entire content of standard input,
// assuming it's UTF-8 encoded, and then passes it to our main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
