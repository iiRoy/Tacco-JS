function ProcessInput(rawData) {
  // Acquire and parse the input parameters
  // The raw input string is split by newline characters to get individual lines.
  let lineData = rawData.split("\n");

  // The first line is further split by spaces to extract numerical parts.
  let firstLineParts = lineData[0].split(" ");

  // Convert the first part of the first line to an integer, representing the initial value.
  let currentValue = Number.parseInt(firstLineParts[0]);

  // Initialize a counter for the number of iterations.
  let iterationCount = 0;

  // Loop as long as the current value is greater than 1.
  while (currentValue > 1) {
    // This inner check is redundant because the while condition already covers it,
    // but it preserves the original control flow.
    if (currentValue <= 1) {
      break; // Exit the loop if the value is 1 or less.
    }

    // Perform division operation: halve the current value and round down.
    currentValue = Math.floor(currentValue / 2);

    // Increment the iteration counter.
    iterationCount++;

    // console.log(currentValue, iterationCount); // Debugging output, currently disabled
  }

  // Prepare and display the final answer.
  // Initialize the result with a default value of 1.
  let finalResult = 1;

  // If the iteration count is greater than 1, calculate a more complex result.
  if (iterationCount > 1) {
    // The calculation involves the square of the iteration count and a power of 2.
    finalResult = (iterationCount * iterationCount - 1) + Math.pow(2, iterationCount);
  }

  // Output the computed final result to the console.
  console.log(finalResult);
}

// Read input from standard input using Node.js file system module
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
