function ProcessInput(inputStr) { // Main processing function for the problem
  // Parse the input string into an array of numbers.
  // Each number is converted from string to numeric type.
  let numArr = inputStr.split(" ").map(val => Number(val));

  // Initialize the final result with the product of the first and fourth elements.
  let finalResult = numArr[0] * numArr[3];

  // Add the product of the second and fifth elements to the result.
  finalResult += numArr[1] * numArr[4];

  // Check a specific condition involving the first three elements.
  if (numArr[0] + numArr[1] > numArr[2] * 2) {
    // If the condition is met, calculate the minimum of the fourth and fifth elements.
    let minVal = Math.min(numArr[3], numArr[4]);

    // Adjust the final result based on the condition and the minimum value.
    finalResult -= (numArr[0] + numArr[1] - numArr[2] * 2) * minVal;

    // Update the fourth and fifth elements by subtracting the minimum value.
    numArr[3] -= minVal;
    numArr[4] -= minVal;
  }

  // Apply another conditional adjustment if the fourth element is positive and a specific condition holds.
  if (numArr[3] > 0 && numArr[0] > numArr[2] * 2) {
    finalResult -= (numArr[0] - numArr[2] * 2) * numArr[3];
  }

  // Apply a final conditional adjustment if the fifth element is positive and a specific condition holds.
  if (numArr[4] > 0 && numArr[1] > numArr[2] * 2) {
    finalResult -= (numArr[1] - numArr[2] * 2) * numArr[4];
  }

  // Output the calculated final result to the console.
  console.log(finalResult);
}

// Read input from standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
