function ProcessInput(incomingData) {
  // Remove any leading or trailing whitespace from the raw string data.
  let processedData = incomingData.trim();

  // Split the string by spaces and convert each resulting substring into a number.
  processedData = processedData.split(" ").map(Number);

  // Calculate the division of the first element by the second and output the result.
  console.log(processedData[0] / processedData[1]);
}

// Read the entire content from standard input as a UTF-8 string and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
