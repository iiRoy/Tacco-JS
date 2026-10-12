const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Acquire raw input from standard input stream

( (rawDataParam) => { // Immediately invoked function expression to process the input

  // Parse the input string into numerical values
  const [valA, valB, valC, numX, numY] = rawDataParam
    .trim() // Remove any leading or trailing whitespace
    .split(' ') // Split the string by spaces to get individual parts
    .map(Number); // Convert each part into a number

  // Calculate the first possible cost scenario
  const costOpt1 = valA * numX + valB * numY;

  // Calculate the second possible cost scenario
  const costOpt2 = valC * Math.max(numX, numY) * 2;

  // Calculate the third possible cost scenario, which is more complex
  const costOpt3 = valA * Math.max(numX - numY, 0) +
                   valB * Math.max(numY - numX, 0) +
                   valC * Math.min(numX, numY) * 2;

  // Print the minimum of the three calculated costs to the console
  console.log(Math.min(costOpt1, costOpt2, costOpt3));

})(rawData); // Pass the raw data to the IIFE for execution
