function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split("\n");

  // Extract and split the first three lines into arrays of strings.
  var timeValues = rawData[0].split(" ");
  var rateA = rawData[1].split(" ");
  var rateB = rawData[2].split(" ");

  // Convert the first two elements of each array to numbers.
  for (var idx = 0; idx < 2; idx++) {
    timeValues[idx] = Number(timeValues[idx]);
    rateA[idx] = Number(rateA[idx]);
    rateB[idx] = Number(rateB[idx]);
  }

  // Calculate the initial difference based on the first set of values.
  var initialDifference = timeValues[0] * rateA[0] - timeValues[0] * rateB[0];

  // Calculate the final difference by adding the second set of values.
  var finalDifference = initialDifference + timeValues[1] * rateA[1] - timeValues[1] * rateB[1];

  // Determine and print the result based on the calculated differences.
  if (finalDifference === 0) {
    console.log('infinity'); // Output for a specific condition.
  } else if (initialDifference * finalDifference > 0) {
    console.log(0); // Output when both differences have the same sign.
  } else if (initialDifference / finalDifference - Math.ceil(initialDifference / finalDifference) === 0) {
    // Check if the division results in an integer.
    console.log(Math.ceil(initialDifference / finalDifference) * 2);
  } else {
    // Default output for other conditions.
    console.log(-Math.ceil(initialDifference / finalDifference) * 2 + 1);
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
