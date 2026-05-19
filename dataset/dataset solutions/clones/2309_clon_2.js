function ProcessInput(rawData) {
  // Trim leading/trailing whitespace from the input string
  rawData = rawData.trim();
  // Split the input string by space to get individual values
  rawData = rawData.split(" ");

  // Parse the input values into numerical variables
  let valX = rawData[0];
  let valY = rawData[1];
  let valZ = rawData[2];

  // Initialize a variable to store the final computed outcome
  let finalOutcome = 0;

  // Calculate two temporary values based on the input
  let tempA = valX - valY;
  let tempB = valZ - 1;

  // Check if the difference between valZ and valY is an even number
  if ((valZ - valY) % 2 === 0) {
    // If the difference is even, apply further adjustments if a condition is met
    if (valZ - valY - 2 >= 0) {
      tempA -= (valZ - valY - 2) / 2;
      tempB -= (valZ - valY - 2) / 2;
    }
  } else {
    // If the difference is odd, apply adjustments if a different condition is met
    if (valZ - valY - 1 >= 0) {
      tempA -= (valZ - valY - 1) / 2;
      tempB -= (valZ - valY - 1) / 2;
    }
  }

  // Set the initial final outcome to the minimum of the two temporary values
  finalOutcome = Math.min(tempA, tempB);

  // Re-check the even difference condition for valZ and valY
  if ((valZ - valY) % 2 === 0) {
    // If it's even, update the final outcome with the minimum of its current value and half the difference
    finalOutcome = Math.min((valZ - valY) / 2, finalOutcome);
  }

  // Output the final computed result to the console
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
