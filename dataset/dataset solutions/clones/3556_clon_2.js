'use modernjs';

function EntryPointHandler(receivedText) {
  // Extract the primary numerical count from the initial line of the input
  const itemCount = Number(
    receivedText.split('\n')[0].split(' ')[0]
  );
  // Retrieve the reference value from the first line of the provided text
  const targetOffset = Number(
    receivedText.split('\n')[0].split(' ')[1]
  );

  let valueDifferences = []; // Container for storing absolute difference values

  // Loop through the second line of the input to compute and store differences
  for (let loopCounter = 0; loopCounter < itemCount; loopCounter++) {
    // Calculate the absolute difference between each parsed number and the target offset
    valueDifferences.push(
      Math.abs(
        Number(receivedText.split('\n')[1].split(' ')[loopCounter]) -
        targetOffset
      )
    );
  }

  // Utility function to compute the Greatest Common Divisor (GCD) using the Euclidean algorithm
  function computeGreatestCommonDivisor(valA, valB) {
    let tempStorage; // A temporary variable used for swaps and remainder storage

    // Ensure that valA is the larger number before proceeding with the algorithm
    if (valA < valB) {
      tempStorage = valA;
      valA = valB;
      valB = tempStorage;
    }

    // Continuously apply the modulo operation until the remainder is zero
    while ((tempStorage = valA % valB) !== 0) {
      valA = valB;
      valB = tempStorage;
    }

    // The last non-zero divisor (now stored in valB) is the GCD
    return valB;
  }

  // Conditional logic to output the final result based on the count of differences
  if (valueDifferences.length === 1) {
    // If only one difference was computed, that single value is the answer
    console.log(valueDifferences[0]);
  } else {
    // For multiple differences, calculate the GCD of all elements
    let overallGCD = computeGreatestCommonDivisor(
      valueDifferences[0],
      valueDifferences[1]
    );

    // Iterate through the remaining differences to find the cumulative GCD
    for (let currentPos = 1; currentPos < itemCount; currentPos++) {
      overallGCD = computeGreatestCommonDivisor(
        overallGCD,
        valueDifferences[currentPos]
      );
    }
    // Print the final, aggregated Greatest Common Divisor to the console
    console.log(overallGCD);
  }
}

// Execute the primary handler function by reading data from standard input
EntryPointHandler(
  require("fs").readFileSync("/dev/stdin", "utf8").trim()
);