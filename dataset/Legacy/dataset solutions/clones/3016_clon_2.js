function ProcessInput(rawData) {
  // This function processes the provided raw input string.
  // It calculates a sum based on absolute values and counts of negative numbers.

  // Split the entire input string by newline characters to get individual lines.
  const lineData = rawData.split('\n');

  // The first line contains the total number of elements (N).
  // Parse it as an integer.
  const numElements = parseInt(lineData[0]);

  // The second line contains space-separated string representations of numbers.
  // Split this line by spaces to get an array of these number strings.
  const elementStrings = lineData[1].split(' ');

  // Initialize variables for our calculations.
  let totalAbsoluteValue = 0; // Accumulates the sum of absolute values of all numbers.
  let negativeCount = 0;      // Keeps track of how many numbers are negative.
  let minimumAbsoluteValue = 9999999999; // Stores the smallest absolute value encountered.
                                        // Initialized with a very large number.

  // An object variable, declared but not used, to maintain structural similarity.
  const tempObject = {};

  // Loop through each element from the input array.
  for (let idx = 0; idx < numElements; idx++) {
    // Get the current element string and convert it to its absolute numeric value.
    // Math.abs implicitly converts the string to a number.
    const currentAbsVal = Math.abs(elementStrings[idx]);

    // Check if the original number (before taking absolute value) was negative.
    // Again, implicit conversion of string to number happens here.
    if (elementStrings[idx] < 0) {
      negativeCount++; // Increment the counter for negative numbers.
    }

    // Compare the current absolute value with the smallest absolute value found so far.
    if (currentAbsVal < minimumAbsoluteValue) {
      minimumAbsoluteValue = currentAbsVal; // Update if a new minimum is found.
    }

    // Add the current absolute value to the running total.
    totalAbsoluteValue = totalAbsoluteValue + currentAbsVal;
  }

  // First output: Print the total count of negative numbers.
  console.log(negativeCount);

  // Based on whether the count of negative numbers is even or odd,
  // determine the final sum to output.
  if (negativeCount % 2 === 0) {
    // If an even number of negatives, the final sum is simply the total absolute value.
    console.log(totalAbsoluteValue);
  } else {
    // If an odd number of negatives, subtract the minimum absolute value from the total sum.
    console.log(totalAbsoluteValue - minimumAbsoluteValue);
  }
}

// Read the input from standard input using Node.js 'fs' module.
// The input is read as a UTF-8 string and then passed to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
