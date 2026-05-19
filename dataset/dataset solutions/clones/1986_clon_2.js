function ProcessInput(rawData) {
  // This function calculates the greatest common divisor for three numbers.
  const computeGreatestCommonDivisor = (firstNum, secondNum, thirdNum) => {
    let currentGCD = 0; // Initialize the variable to store the GCD

    // Iterate from 1 up to a reasonable maximum (200 in this case)
    // to find the largest common divisor.
    for (let potentialDivisor = 1; potentialDivisor <= 200; potentialDivisor++) {
      // Check if the current potentialDivisor divides all three numbers evenly.
      if (firstNum % potentialDivisor === 0 && secondNum % potentialDivisor === 0 && thirdNum % potentialDivisor === 0) {
        currentGCD = potentialDivisor; // Update currentGCD if it's a common divisor
      }
    }

    return currentGCD; // Return the largest common divisor found
  };

  // Split the raw input string into an array of lines.
  const inputLines = rawData.split("\n");

  // Convert the first line of input to a number, which represents the upper limit.
  const limitValue = Number(inputLines[0]);

  let cumulativeSum = 0; // Initialize a variable to accumulate the sums of GCDs.

  // Start a triple-nested loop, iterating from 1 up to limitValue for each variable.
  for (let outerLoopVar = 1; outerLoopVar <= limitValue; outerLoopVar++) {
    for (let middleLoopVar = 1; middleLoopVar <= limitValue; middleLoopVar++) {
      for (let innerLoopVar = 1; innerLoopVar <= limitValue; innerLoopVar++) {
        // Calculate the GCD for the current combination of three numbers
        // and add it to the cumulative sum.
        cumulativeSum += computeGreatestCommonDivisor(outerLoopVar, middleLoopVar, innerLoopVar);
      }
    }
  }

  // Output the final calculated cumulative sum to the console.
  console.log(cumulativeSum);
}

// The following line handles reading input from standard input and invoking the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
