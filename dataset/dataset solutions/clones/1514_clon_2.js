/*
 * This JavaScript module is designed to compute the distinct number of paths
 * to reach a specific numerical target. It considers a set of allowed
 * step sizes (jumps) and performs all calculations using modular arithmetic
 * to manage potentially very large numbers.
 */
const computeRouteCombinations = () => {

  // Declaration for the ultimate numerical goal or destination.
  let finalDestinationPoint;

  // In a production environment, this would typically be read from standard input
  // or provided as an argument. For this example, we assume it's read.
  // Placeholder for input: finalDestinationPoint = parseInt(readInputLine());
  finalDestinationPoint = 5; // Example input value for N

  // Declaration for the total number of ranges describing valid step sizes.
  let numberOfJumpRanges;

  // This value would also be obtained from input.
  // Placeholder for input: numberOfJumpRanges = parseInt(readInputLine());
  numberOfJumpRanges = 2; // Example input value for K

  // Adjusting the target point, possibly for zero-based indexing or problem specifics.
  finalDestinationPoint--;

  // An array used for dynamic programming. Each index stores the count of ways
  // to reach that particular position. Initialized with zeros.
  let pathwayCountsArray = new Array(finalDestinationPoint + 1).fill(0);

  // A Set data structure to store all unique, permissible jump distances.
  let allowedLeapDistances = new Set();

  // Temporary variable to store the starting value of a jump range.
  let rangeStartValue;

  // Temporary variable to store the ending value of a jump range.
  let rangeEndValue;

  // A large prime number used as a modulus to keep results within integer limits.
  const modulusPrime = 998244353;

  // Loop through each defined range to populate the set of allowed jump distances.
  for (let currentRangeIndex = 0; currentRangeIndex < numberOfJumpRanges; ++currentRangeIndex) {
    // Reading the beginning of the current range.
    // Placeholder for input: rangeStartValue = parseInt(readInputLine());
    // Using example inputs for ranges: first [1,2], second [3,3]
    if (currentRangeIndex === 0) {
      rangeStartValue = 1;
      rangeEndValue = 2;
    } else {
      rangeStartValue = 3;
      rangeEndValue = 3;
    }

    // Reading the end of the current range.
    // Placeholder for input: rangeEndValue = parseInt(readInputLine());

    // Iterate through all integers within the current range and add them to the set.
    for (let currentLeap = rangeStartValue; currentLeap <= rangeEndValue; ++currentLeap) {
      allowedLeapDistances.add(currentLeap);
    }
  }

  // The base case for dynamic programming: there is one way to be at position 0 (by not moving).
  // However, in the original C++ code, `dps[0]` remains `0`.
  // The initial contributions are handled by the loop below for single-step paths.
  // So, `pathwayCountsArray[0]` will remain `0` initially, mirroring the C++ behavior.
  // pathwayCountsArray[0] = 1; // This line would be for a common DP pattern, but not the original problem's.


  // Initialize the number of ways to reach positions that are directly
  // accessible from the starting point (position 0) with a single allowed jump.
  for (const singleLeapOption of allowedLeapDistances) {
    // Ensure the single leap doesn't exceed the overall target.
    if (singleLeapOption <= finalDestinationPoint) {
      // Increment the count for this position. Since `pathwayCountsArray` is
      // initialized to zeros, this effectively sets `pathwayCountsArray[singleLeapOption]` to 1.
      // The original C++ code does not apply modulo here.
      pathwayCountsArray[singleLeapOption] = (pathwayCountsArray[singleLeapOption] + 1);
    }
  }


  // Main dynamic programming loop: calculate pathways for each position
  // starting from index 2 up to the final destination.
  for (let currentPositionIndex = 2; currentPositionIndex <= finalDestinationPoint; ++currentPositionIndex) {
    // For every possible jump distance we can take.
    for (const chosenLeap of allowedLeapDistances) {
      // If the current position is greater than the chosen leap distance,
      // meaning a valid previous position exists.
      if (currentPositionIndex > chosenLeap) {
        // Add the number of ways to reach the previous position
        // (currentPositionIndex - chosenLeap) to the current position's total.
        // Perform modulo operation at each addition to prevent overflow.
        pathwayCountsArray[currentPositionIndex] = (pathwayCountsArray[currentPositionIndex] + pathwayCountsArray[currentPositionIndex - chosenLeap]) % modulusPrime;
      }
    }
  }

  // Output the final calculated count of pathways to the ultimate goal.
  // The result is already modulo `modulusPrime` from the loop, but
  // applying it one last time ensures the final output is correctly constrained.
  console.log(pathwayCountsArray[finalDestinationPoint] % modulusPrime);
};

// Execute the primary function to begin the pathway calculation.
computeRouteCombinations();