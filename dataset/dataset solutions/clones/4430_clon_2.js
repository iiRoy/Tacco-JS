function ProcessInput(rawData) {
  // Remove leading/trailing whitespace from the raw input string
  let processedData = rawData.trim();

  // Split the string by spaces and convert each part to a number
  // The result is an array of numbers
  processedData = processedData.split(" ").map(Number);

  // Perform the calculation: (first_number - 1) + (second_number - 1)
  // And print the result to the standard output
  console.log((processedData[0] - 1) + (processedData[1] - 1));
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
