// This script processes a numerical input to calculate a specific value.
function ProcessInput(rawData) {
  // The original code had a commented-out line for splitting input, which is not used.
  // We parse the raw string input into an integer, using base 10.
  let remainingValue = parseInt(rawData, 10);
  let totalOperations = +0; // Initialize the counter for operations.

  // This outer loop is designed to run exactly once, as it contains an unconditional break.
  while (!false) {
    // First, we handle powers of 9.
    // This loop finds the largest power of 9 less than or equal to the current remainingValue.
    for (let powerOfNine = 9.0; ; powerOfNine *= 9.0) {
      // If subtracting the current powerOfNine would make remainingValue negative,
      // it means the previous powerOfNine was the largest one that fit.
      if (remainingValue - powerOfNine < 0) {
        // Check if we've gone past the initial 9.
        if (powerOfNine !== 9.0) {
          // Revert to the previous power of 9.
          powerOfNine /= 9.0;
          // Subtract this power of 9 from the remainingValue.
          remainingValue -= powerOfNine;
          // Increment the operation count.
          totalOperations++;
        } else {
          // If the first powerOfNine (which is 9) is already too large,
          // we can't use any power of 9. Break out of this inner loop.
          break;
        }
      }
    }

    // Next, we handle powers of 6, using the same logic as for powers of 9.
    // This loop finds the largest power of 6 less than or equal to the current remainingValue.
    for (let powerOfSix = 6.0; ; powerOfSix *= 6.0) {
      // If subtracting the current powerOfSix would make remainingValue negative,
      // it means the previous powerOfSix was the largest one that fit.
      if (remainingValue - powerOfSix < 0) {
        // Check if we've gone past the initial 6.
        if (powerOfSix !== 6.0) {
          // Revert to the previous power of 6.
          powerOfSix /= 6.0;
          // Subtract this power of 6 from the remainingValue.
          remainingValue -= powerOfSix;
          // Increment the operation count.
          totalOperations++;
        } else {
          // If the first powerOfSix (which is 6) is already too large,
          // we can't use any power of 6. Break out of this inner loop.
          break;
        }
      }
    }

    // After processing powers of 9 and 6, any remaining value is added directly to the total operations.
    totalOperations += remainingValue;
    // The outer while loop always breaks after one iteration.
    break;
  }

  // Output the final calculated total operations to the console.
  console.log(totalOperations);
}

// The following line handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
