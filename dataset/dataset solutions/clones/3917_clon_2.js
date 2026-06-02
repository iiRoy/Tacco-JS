function ProcessInput(inputString) {
  // Parse the input string into an array of numbers, sort them in descending order.
  // The input is expected to be a single line of space-separated integers.
  let numericValues = inputString
    .split("\n")[0] // Extract the first line of the input string
    .split(" ") // Split the line by spaces to get individual number strings
    .map(elementValue => parseInt(elementValue, 10)) // Convert each string element to an integer
    .sort((firstNum, secondNum) => secondNum - firstNum); // Sort the numbers in descending order

  // Initialize a counter to track the number of operations performed.
  let operationCount = 0;

  // Check if the difference between the second and third largest numbers is even.
  if ((numericValues[1] - numericValues[2]) % 2 === 0) {
    // If the difference is even, proceed with adjustments until all three numbers are equal.
    while (numericValues[0] !== numericValues[1] || numericValues[0] !== numericValues[2]) {
      // If the largest number is greater than the second largest, increment the second and third numbers.
      if (numericValues[0] > numericValues[1]) {
        numericValues[1]++;
        numericValues[2]++;
        operationCount++; // Increment the operation counter
      } else {
        // Otherwise, increment the third number by two.
        numericValues[2] += 2;
        operationCount++; // Increment the operation counter
      }
    }
  } else {
    // If the difference is odd, perform an initial adjustment: increment the largest and second largest numbers.
    numericValues[0]++;
    numericValues[1]++;
    operationCount++; // Increment the operation counter
    // Then, proceed with further adjustments until all three numbers are equal.
    while (numericValues[0] !== numericValues[1] || numericValues[0] !== numericValues[2]) {
      // If the largest number is greater than the second largest, increment the second and third numbers.
      if (numericValues[0] > numericValues[1]) {
        numericValues[1]++;
        numericValues[2]++;
        operationCount++; // Increment the operation counter
      } else {
        // Otherwise, increment the third number by two.
        numericValues[2] += 2;
        operationCount++; // Increment the operation counter
      }
    }
  }

  // Output the final calculated operation count to the console.
  console.log(operationCount);
}

// Read the entire content of standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
