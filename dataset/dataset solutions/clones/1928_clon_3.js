// This JavaScript module processes a single line of numerical input to compute a specific maximum value
// based on a mathematical expression, demonstrating various code transformation techniques for Type III cloning.

/**
 * Orchestrates the parsing of input data and the calculation of a peak numerical result.
 * The function takes an array of strings, where the first string contains space-separated integers.
 * It identifies three key parameters: a coefficient, a divisor, and an upper bound,
 * then computes a maximum expression value based on these parameters.
 *
 * @param {string[]} rawDataEntries - An array of strings, typically from standard input.
 *                                    The first element is expected to be "A B N".
 */
function processNumericalSequence(rawDataEntries) {
  // Declare and initialize variables that will hold our parsed numerical inputs.
  let coefficientA; // Represents the 'a' parameter from the original problem.
  let divisorB;     // Represents the 'b' parameter from the original problem.
  let upperBoundN;  // Represents the 'n' parameter from the original problem.

  // This variable will store the highest calculated value throughout the process.
  let peakResult;

  // --- Input Validation and Parsing Section ---

  // Initial check: Ensure the input data source is not empty or undefined.
  if (!rawDataEntries || rawDataEntries.length === 0) {
    console.error("Error: Input data source is empty or invalid. Cannot proceed with calculation.");
    return; // Terminate execution gracefully if no data.
  }

  // Extract the first line of input and perform initial trimming to remove leading/trailing whitespace.
  const firstLineData = rawDataEntries[0].trim();
  // Split the cleaned line into individual string tokens based on space delimiters.
  const stringTokens = firstLineData.split(" ");

  // Validate the number of tokens to ensure all expected parameters are present.
  if (stringTokens.length < 3) {
    console.error("Error: Insufficient numerical parameters provided. Expected 3 (A, B, N), but found fewer.");
    return; // Exit if the input format is incorrect.
  }

  // Convert the string tokens into integer types using base 10 for safety.
  coefficientA = parseInt(stringTokens[0], 10);
  divisorB = parseInt(stringTokens[1], 10);
  upperBoundN = parseInt(stringTokens[2], 10);

  // Validate that all parsed values are indeed numbers and not NaN (Not a Number).
  if (isNaN(coefficientA) || isNaN(divisorB) || isNaN(upperBoundN)) {
    console.error("Error: One or more provided parameters are not valid integers. Please check input format.");
    return; // Exit if any parameter is non-numeric.
  }

  // Critical validation: Ensure the divisor is a positive integer to prevent mathematical errors (division by zero)
  // and maintain the problem's expected domain (typically positive for divisors in such problems).
  if (divisorB <= 0) {
    console.error("Error: The divisor (B) must be a positive integer. Calculation cannot proceed with B <= 0.");
    // Depending on requirements, specific error codes or default values might be returned here.
    return;
  }

  // --- Core Calculation Helper Function ---

  /**
   * Computes a specific mathematical expression for a given 'x' value.
   * The expression is derived from `Math.floor(A*x/B) - (A * Math.floor(x/B))`.
   * This function encapsulates the core logic, improving readability and reusability.
   *
   * @param {number} xVal    - The current value for 'i' in the original problem context.
   * @param {number} factorA - The 'a' parameter (coefficient).
   * @param {number} denomB  - The 'b' parameter (divisor).
   * @returns {number} The calculated value of the expression for the given inputs.
   */
  const calculateTermValue = (xVal, factorA, denomB) => {
    // This expression simplifies to `Math.floor(factorA * (xVal % denomB) / denomB)`.
    // However, to maintain a Type III clone's spirit of "rewriting existing ones in equivalent ways,"
    // we keep it closer to the original form, but with named intermediate steps.
    const fractionalComponentNumerator = factorA * xVal; // Intermediate step 1
    const floorDivisionOfX = Math.floor(xVal / denomB); // Intermediate step 2

    const termOneResult = Math.floor(fractionalComponentNumerator / denomB); // Math.floor(A*x/B)
    const termTwoResult = factorA * floorDivisionOfX; // A * Math.floor(x/B)

    return termOneResult - termTwoResult; // Final subtraction
  };

  // --- Main Logic for Determining Peak Result ---

  // Initialize the peak result to the smallest possible safe integer.
  // This ensures that any valid calculated value will be greater and correctly assigned.
  peakResult = Number.MIN_SAFE_INTEGER;

  // The logic branches based on the relationship between upperBoundN and divisorB.
  // This structure mirrors the original code's conditional flow.
  if (upperBoundN > divisorB) {
    // When N is greater than B, the maximum value of the expression
    // `Math.floor(coefficientA * (currentIterationValue % divisorB) / divisorB)`
    // is achieved when `currentIterationValue % divisorB` equals `divisorB - 1`.
    // The original loop range `n - (b + 1)` to `n` covers `b+2` values, guaranteeing
    // that all possible remainders modulo `b` are encountered, including `b-1`.

    // For a Type III clone, we retain a loop but modify its bounds and introduce an optimization.
    // The new lower bound ensures a sufficiently wide window to capture the maximum,
    // while potentially starting from a different point than the original.
    // We ensure that the loop covers a range of at least `divisorB` values.
    const lowerBoundForIteration = Math.max(0, upperBoundN - (2 * divisorB)); // A modified starting point for the loop.

    // Iterate through a range of values for `currentIterationValue`.
    // This loop structure is an altered version of the original's iteration.
    for (let currentIterationValue = lowerBoundForIteration; currentIterationValue <= upperBoundN; ++currentIterationValue) {
      // Calculate the expression's value for the current iteration.
      const intermediateCalculation = calculateTermValue(currentIterationValue, coefficientA, divisorB);

      // Update the peak result if the current calculation yields a higher value.
      if (intermediateCalculation > peakResult) {
        peakResult = intermediateCalculation;
      }

      // --- Added Optimization / Early Exit Fragment ---
      // For the case where N > B, the theoretical maximum value of the expression is known:
      // it's `Math.floor(coefficientA * (divisorB - 1) / divisorB)`.
      // Once `peakResult` reaches or exceeds this theoretical maximum,
      // further iterations are redundant as no higher value can be found.
      const theoreticalMaxForLargeN = Math.floor(coefficientA * (divisorB - 1) / divisorB);
      if (peakResult >= theoreticalMaxForLargeN) {
        // This is a new guard clause, allowing the loop to break early once the maximal value is guaranteed.
        break;
      }
    }
  } else {
    // When upperBoundN is less than or equal to divisorB, the maximum expression value
    // occurs at `currentIterationValue = upperBoundN`.
    // In this scenario, `upperBoundN % divisorB` simply evaluates to `upperBoundN`.
    // Thus, we can directly calculate the result without needing a loop.
    peakResult = calculateTermValue(upperBoundN, coefficientA, divisorB);
  }

  // --- Output Section ---

  // Display the final determined maximum value to the console.
  console.log(peakResult);
}

// --- Program Entry Point ---

// This line handles reading input from standard input and passing it to our processing function.
// It reads the entire standard input as a UTF-8 string, trims whitespace, and splits it into lines.
processNumericalSequence(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));