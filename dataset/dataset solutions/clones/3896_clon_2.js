function ProcessInput(incomingData) {
  // Split the raw input string into an array of lines.
  incomingData = incomingData.split("\n");

  // Parse the first line to get configuration parameters.
  // These parameters are N, M, X from the problem description.
  var configParams = incomingData[0].split(" ");

  // Parse the second line to get the array of values.
  var dataArray = incomingData[1].split(" ");

  // Iterate through a portion of the data array based on a configuration parameter.
  for (var idx = 0; idx < configParams[1]; idx++) {
    // Check if the current element in the data array exceeds a specified threshold.
    if (dataArray[idx] > configParams[2]) {
      // If the threshold is exceeded, determine which value to output.
      // This logic calculates the minimum distance from either end of a conceptual range.
      if (idx > configParams[1] - idx) {
        // Output the distance from the "right" end.
        console.log(configParams[1] - idx);
        return; // Exit the function immediately after output.
      } else {
        // Output the distance from the "left" end.
        console.log(idx);
        return; // Exit the function immediately after output.
      }
    }
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
