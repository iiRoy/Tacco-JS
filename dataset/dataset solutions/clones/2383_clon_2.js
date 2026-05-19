function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split('\n');

  // Parse the first three lines into arrays of strings
  var timeValues = rawData[0].split(' ');
  var rateA = rawData[1].split(' ');
  var rateB = rawData[2].split(' ');

  // Convert string values to numbers for the first two elements of each array
  for (var k = 0; k < 2; k++) {
    timeValues[k] = Number(timeValues[k]);
    rateA[k] = Number(rateA[k]);
    rateB[k] = Number(rateB[k]);
  }

  // Calculate the difference products for two scenarios
  var diffProducts = new Array(2);
  diffProducts[0] = timeValues[0] * rateA[0] - timeValues[0] * rateB[0];
  diffProducts[1] = timeValues[1] * rateA[1] - timeValues[1] * rateB[1];

  // Initialize variables for the iterative calculation
  var currentSum = 0;
  var previousSum = 1;
  var unusedVar = 0; // This variable is declared but not used in the original logic
  var iterationCount = -1;

  // Check for a specific condition to determine output
  if (diffProducts[0] === diffProducts[1] * -1) {
    // If the condition is met, output 'infinity'
    console.log('infinity');
  } else {
    // Otherwise, perform an iterative calculation
    for (var loopVar = 0; loopVar < 1; loopVar) { // Loop continues until 'loopVar' is explicitly set to 1
      iterationCount++; // Increment the counter for each iteration
      previousSum = currentSum; // Store the current sum as the previous sum
      currentSum += diffProducts[iterationCount % 2]; // Add a value from diffProducts based on modulo of iterationCount

      // Check if the product of current and previous sums is positive
      if (currentSum * previousSum > 0) {
        loopVar = 1; // Terminate the loop by setting loopVar to 1
      }
    }
    // Output the final calculated value
    console.log(iterationCount - 1);
  }
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
