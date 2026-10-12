function ProcessInput(rawData) {
  // This function processes the provided raw data.
  // The rawData string is expected to contain multiple lines.

  rawData = rawData.split("\n"); // Break the input string into an array of lines.

  let firstLineParts = rawData[0].split(' '); // Split the first line by spaces.
  let itemCount = Number(firstLineParts[0]); // Convert the first part to a number.
  let upperBound = Number(firstLineParts[1]); // Convert the second part to a number.

  let secondLineValues = rawData[1].split(' '); // Split the second line by spaces.
  let processedValues = []; // Initialize an empty array to store modified numbers.

  // Iterate through the numbers from the second line.
  for (let idx = 0; idx < itemCount; idx++) {
    // Convert each string value to a number, multiply by 0.5, and add to the new list.
    processedValues.push(Number(secondLineValues[idx]) * 0.5);
  }

  // Calculate the product of all elements in the processedValues array.
  let currentProduct = processedValues.reduce((accumulator, currentValue) => accumulator * currentValue);

  let iterations = 0; // Initialize a counter for the loop.

  // Keep doubling the product until it is no longer less than or equal to the upper bound.
  while (upperBound > currentProduct) {
    currentProduct += currentProduct; // Double the current product.
    iterations++; // Increment the iteration counter.
  }

  // Output the final count of iterations.
  console.log(iterations);
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be altered as it's part of the environment setup.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
