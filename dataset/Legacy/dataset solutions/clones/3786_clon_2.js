function ProcessInput(rawData) {
  // Remove any leading or trailing whitespace from the raw input string.
  let processedData = rawData.trim();

  // Split the string by spaces and convert each part into a number.
  processedData = processedData.split(" ").map(Number);

  // Calculate the maximum value among three arithmetic operations on the first two numbers.
  let finalOutcome = Math.max(processedData[0] + processedData[1], processedData[0] - processedData[1], processedData[0] * processedData[1]);

  // If the calculated outcome is negative zero, normalize it to positive zero.
  if (finalOutcome === -0) {
    finalOutcome = 0;
  }

  // Print the final computed numerical result to the console.
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
