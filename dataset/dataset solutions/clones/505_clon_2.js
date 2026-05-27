function ProcessInput(rawData) {
  // Split the incoming data by newline characters to get an array of lines.
  var dataRows = rawData.split('\n');

  // Initialize a variable to hold the cumulative sum.
  var totalSum = 0;

  // Iterate through the first ten elements of the dataRows array.
  for (var idx = 0; idx < 10; ++idx) {
    // If a line contains only a newline character, it signifies the end of meaningful input.
    if (dataRows[idx] === "\n") {
      break; // Terminate the loop early.
    }
    // Convert the current line to an integer and add it to the running total.
    totalSum += parseInt(dataRows[idx]);
  }

  // Display the final calculated sum to the standard output.
  console.log(totalSum);
}

// Read the entire content from standard input synchronously using Node.js 'fs' module,
// then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
