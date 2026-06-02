function processInput(rawData) {
  // This function takes a raw string input and processes it according to specific rules.
  const parameters = rawData.split(" "); // Divide the input string into an array of substrings using space as a delimiter.
  const firstParam = parameters[0]; // Store the first element of the split array.
  const secondParam = parameters[1]; // Store the second element of the split array.

  // Check if the second parameter is the string '1'.
  if (secondParam === '1') {
    console.log("0"); // If it is, print "0" to the console.
    return; // Exit the function immediately.
  }

  // Convert the string parameters to numerical types for calculations.
  var firstValue = Number(firstParam); // Numeric representation of the first parameter.
  var secondValue = Number(secondParam); // Numeric representation of the second parameter.
  var currentSum = Number(firstParam); // Initialize a running total with the first numeric value.
  var iterationCount = 1; // Initialize a counter for the loop iterations.

  // Begin a loop that continues as long as the current sum is less than the second numeric value.
  while (currentSum < secondValue) {
    iterationCount++; // Increment the iteration counter.
    currentSum = currentSum - 1 + firstValue; // Update the current sum using the defined arithmetic operation.
  }

  // After the loop terminates, print the final iteration count to the console.
  console.log(iterationCount);
}

// Read the content of standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
