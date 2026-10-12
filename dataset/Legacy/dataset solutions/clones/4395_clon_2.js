function ProcessInput(rawData) {
  // Split the incoming string by space to get individual values.
  rawData = rawData.split(' ');

  // Calculate the absolute difference between the first and second values.
  let diffOne = Math.abs(Number(rawData[0]) - Number(rawData[1]));

  // Calculate the absolute difference between the first and third values.
  let diffTwo = Math.abs(Number(rawData[0]) - Number(rawData[2]));

  // Compare the two calculated differences.
  if (diffOne > diffTwo) {
    // If the first difference is greater, log 'B'.
    console.log("B");
  } else {
    // Otherwise (if diffOne is less than or equal to diffTwo), log 'A'.
    console.log("A");
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
