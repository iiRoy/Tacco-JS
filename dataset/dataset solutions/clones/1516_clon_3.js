const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedLines = []; // Buffer to store all lines read from standard input
let inputDataSource;     // Object responsible for sequential input line retrieval

// Event listener to collect each line as it's provided via stdin
inputProcessor.on('line', (currentLine) => {
  collectedLines.push(currentLine);
});

// Event listener triggered when all input has been received (e.g., EOF)
inputProcessor.on('close', () => {
  inputDataSource = buildInputHandler(collectedLines); // Prepare the input stream for processing
  console.error('--- Input acquisition complete, initiating computational sequence ---'); // A diagnostic message
  executeProblemSolver(); // Begin the main problem-solving algorithm
});

/**
 * Constructs an object responsible for managing sequential access to provided input lines.
 * This ensures that input lines are consumed one by one in order.
 * @param {string[]} rawInputStrings - An array of raw string inputs.
 * @returns {object} An interface with methods to check for and retrieve subsequent input lines.
 */
function buildInputHandler(rawInputStrings) {
  let currentIndex = 0;
  const totalAvailableLines = rawInputStrings.length;

  // Define methods using closures to capture currentIndex and totalAvailableLines
  // This ensures they correctly refer to the internal state of this handler.
  const hasMoreLines = () => currentIndex < totalAvailableLines;
  const retrieveNextLine = () => {
    if (hasMoreLines()) {
      return rawInputStrings[currentIndex++];
    } else {
      // Provide a clear error message if input is exhausted unexpectedly.
      throw new Error('InputStreamError: Attempted to read past the end of the input stream.');
    }
  };

  return {
    hasMoreLines: hasMoreLines,
    retrieveNextLine: retrieveNextLine
  };
}

/**
 * Transforms a raw string input into a specific data type or structure
 * based on a given format identifier. This utility centralizes data parsing.
 * @param {string} rawString - The string value to be converted.
 * @param {number} formatId - A numeric code dictating the conversion type.
 *   - 1: Converts the string to an integer (base 10).
 *   - 4: Splits the string by space, then converts each resulting part to a number,
 *        returning an array of numbers.
 *   (Other format IDs from the original utility are omitted as they are not
 *   directly utilized in the main problem-solving logic.)
 * @returns {*} The converted data. Returns the original string if conversion fails or formatId is unknown.
 */
const dataTransformationUtility = (rawString, formatId) => {
  try {
    const transformationMap = {
      1: (s) => parseInt(s, 10), // Parse string to integer
      4: (s) => s.split(' ').map(Number), // Split by space, map to numbers
    };
    const transformer = transformationMap[formatId];
    if (transformer) {
      return transformer(rawString);
    } else {
      // Log a warning for unsupported format IDs, but return raw string to avoid hard crash.
      console.warn(`DataTransformationWarning: Unknown format ID ${formatId} provided. Returning raw string.`);
      return rawString;
    }
  } catch (err) {
    // Log detailed error information during transformation failures.
    console.error(`DataTransformationError: Failed to transform "${rawString}" with ID ${formatId}. Error: ${err.message}`);
    return rawString; // On error, return the original string to allow downstream handling.
  }
};

// Simplified input retrieval functions leveraging the inputDataSource and dataTransformationUtility.
const fetchRawLine = () => inputDataSource.retrieveNextLine();
const fetchNumericArray = () => dataTransformationUtility(fetchRawLine(), 4);
const fetchSingleNumeric = () => dataTransformationUtility(fetchRawLine(), 1);


// Function designated for presenting the final computed result to standard output.
const outputFinalResult = (computedValue) => {
  console.log(computedValue);
};

// --- End of input/output handling and basic utilities ---


// Core algorithmic function to solve the problem using dynamic programming.
// This function orchestrates the reading of input, DP table construction,
// and final result output.
function executeProblemSolver() {
  // Retrieve the primary parameters from the first line of input:
  // totalSteps represents 'N' (the target size for DP table).
  // numSegments represents 'K' (the count of allowed jump ranges).
  const [totalSteps, numSegments] = fetchNumericArray();

  // Implement a preliminary check for valid input parameters.
  // If parameters are non-positive or illogical, the result is trivially 0,
  // and further computation is unnecessary.
  if (totalSteps <= 0 || numSegments < 0) {
    outputFinalResult(0);
    return;
  }

  // Define the modulo constant. This is a large prime number frequently used
  // in competitive programming to keep results within integer bounds and
  // prevent overflow, especially in counting problems.
  const computationalModulus = 998244353;

  // Initialize the dynamic programming array (dpTable) and its corresponding
  // prefix sum array (prefixSumTable). Both arrays are sized 'totalSteps'
  // and are initially filled with zeros.
  const dpTable = Array.from({ length: totalSteps }, () => 0);
  const prefixSumTable = Array.from({ length: totalSteps }, () => 0);

  // Establish the base case for the DP calculation.
  // For many counting problems, dpTable[0] (representing the start or initial state) is 1.
  dpTable[0] = 1;
  prefixSumTable[0] = 1; // The prefix sum at index 0 is simply the value of dpTable[0].

  // Process and store all allowed segment ranges (L, R).
  // Each segment defines a permissible jump distance from a previous step.
  // Using Array.from with a mapping function to concisely populate the array.
  const permissibleSegments = Array.from({ length: numSegments }, () => {
    const [lowerBound, upperBound] = fetchNumericArray(); // Read L and R for each segment
    return { minJump: lowerBound, maxJump: upperBound }; // Store as an object for clarity
  });

  // Main DP loop: Iterate through each step from 1 up to (totalSteps - 1)
  // to progressively build the dpTable.
  for (let currentStep = 1; currentStep < totalSteps; ++currentStep) {
    let accumulatedValueForCurrentStep = 0; // Temporary variable to sum contributions for dpTable[currentStep].

    // For each permissible segment, calculate its contribution to the current step.
    permissibleSegments.forEach(segment => {
      const { minJump, maxJump } = segment;

      // Determine the range of previous steps (k) that can contribute to currentStep
      // using the current segment's jump distances [minJump, maxJump].
      // k_max corresponds to `currentStep - minJump` (maximum previous step index)
      // k_min corresponds to `currentStep - maxJump` (minimum previous step index)
      const upperIndexForSum = currentStep - minJump;
      const lowerIndexForSum = currentStep - maxJump;

      // If the upper index for summation is negative, it means even the smallest jump
      // (minJump) would result in a negative previous step, so this segment cannot
      // contribute to currentStep.
      if (upperIndexForSum < 0) {
        return; // Skip to the next segment as it's out of bounds.
      }

      let segmentContribution = 0;

      // Calculate the sum of dpTable values from lowerIndexForSum to upperIndexForSum
      // using the prefixSumTable.
      // The sum S(k_min, k_max) = dpTable[k_min] + ... + dpTable[k_max]
      // is equivalent to prefixSumTable[k_max] - prefixSumTable[k_min - 1].
      // Special care is taken for boundary conditions (when k_min - 1 is negative).

      const valueAtUpperIdx = (upperIndexForSum >= 0) ? prefixSumTable[upperIndexForSum] : 0;
      const valueAtLowerIdxMinusOne = (lowerIndexForSum > 0) ? prefixSumTable[lowerIndexForSum - 1] : 0;

      segmentContribution = valueAtUpperIdx - valueAtLowerIdxMinusOne;

      // Accumulate the contribution. The addition of 'computationalModulus' before
      // the final modulo ensures that the result is always positive, even if
      // 'segmentContribution' was negative due to subtraction (e.g., if valueAtUpperIdx < valueAtLowerIdxMinusOne).
      accumulatedValueForCurrentStep = (accumulatedValueForCurrentStep + segmentContribution + computationalModulus) % computationalModulus;
    });

    // Assign the total accumulated contribution to the current step in the DP table.
    dpTable[currentStep] = accumulatedValueForCurrentStep;

    // Update the prefix sum table for the current step.
    // prefixSumTable[currentStep] = (dpTable[currentStep] + prefixSumTable[currentStep - 1]) % computationalModulus.
    prefixSumTable[currentStep] = (dpTable[currentStep] + prefixSumTable[currentStep - 1]) % computationalModulus;
  }

  // The final answer for the problem is typically the value computed for the last step.
  outputFinalResult(dpTable[totalSteps - 1]);
}