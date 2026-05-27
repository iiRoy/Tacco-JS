function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  let processedData = rawData.split('\n');

  // Remove the first line, which might contain metadata or be an empty string.
  processedData.shift();

  // Process each remaining line: split by space and convert parts to integers.
  processedData = processedData.map(function(lineStr) {
    // For each line, split it by spaces.
    return lineStr.split(' ').map(function(numStr) {
      // Convert each resulting string part into an integer, using base 10.
      return parseInt(numStr, 10);
    });
  });

  // Initialize a variable to accumulate the final computed value.
  let totalSum = 0;

  // Iterate through each array of numbers obtained from the input lines.
  for (let idx = 0; idx < processedData.length; idx++) {
    // For each pair of numbers [a, b], calculate (b - a + 1) and add it to the total sum.
    // This effectively counts the number of integers from 'a' to 'b' inclusive.
    totalSum += (processedData[idx][1] - processedData[idx][0] + 1);
  }

  // Output the final calculated sum to the console, formatted as a decimal integer.
  console.log('%d', totalSum);
}

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
