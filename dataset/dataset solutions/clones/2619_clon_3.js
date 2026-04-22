/**
 * Processes raw input text to calculate a series of inversion counts
 * based on a given numeric sequence and a specified repetition factor.
 *
 * This function reads two lines of input:
 * 1. The first line contains two space-separated integers:
 *    `sequenceLength` (N) - the number of elements in the base sequence.
 *    `targetRepetitions` (K) - the number of times the sequence is conceptually repeated.
 * 2. The second line contains `sequenceLength` space-separated integers,
 *    representing the elements of the base numeric sequence.
 *
 * The core logic calculates inversions for the base sequence (A) and for
 * the base sequence repeated twice (A+A), then extrapolates for `K` repetitions
 * using a specific linear recurrence relation.
 *
 * @param {string} rawInputText - The complete input string, typically originating from standard input.
 *                                Expected format:
 *                                N K
 *                                A_1 A_2 ... A_N
 */
function processInputData(rawInputText) {
  // Define a constant for the modulo operation. This is frequently used
  // in problems where results can become very large.
  const LARGE_PRIME_MODULO = 1_000_000_000 + 7; // A common prime modulus (10^9 + 7)

  // --- Input Parsing and Initial Setup ---

  // Split the entire input string into individual lines and remove any leading/trailing whitespace.
  const inputLines = rawInputText.trim().split('\n');

  // Attempt to parse the first line, which contains the sequence length (N) and repetition factor (K).
  const [lengthStr, repetitionsStr] = inputLines[0].split(' ');
  const sequenceLength = Number(lengthStr);
  const targetRepetitions = Number(repetitionsStr);

  // Validate the parsed numerical inputs. Early exit if they are not valid positive integers.
  if (isNaN(sequenceLength) || isNaN(targetRepetitions) || sequenceLength < 1 || targetRepetitions < 1) {
    console.error("Input Error: Sequence length (N) and repetition factor (K) must be positive integers.");
    return; // Halt execution for invalid input.
  }

  // Parse the second line, converting the space-separated string of numbers into a numeric array.
  const baseNumericSequence = inputLines[1].split(' ').map(Number);

  // Perform an additional validation to ensure the parsed sequence matches the declared length.
  if (baseNumericSequence.length !== sequenceLength) {
      console.error(`Input Error: Declared sequence length (N=${sequenceLength}) does not match actual element count (${baseNumericSequence.length}).`);
      return;
  }

  // Construct an extended sequence by concatenating the base sequence with itself.
  // This is used for calculating inversions in a 'doubled' array (A+A).
  const doubledNumericSequence = baseNumericSequence.concat(baseNumericSequence);

  // --- Core Logic: Helper Function for Inversion Counting ---

  /**
   * Calculates the total number of inversions within a given array of numbers.
   * An inversion is defined as a pair of elements (arr[i], arr[j]) such that
   * their indices satisfy i < j, but their values satisfy arr[i] > arr[j].
   * This implementation uses a brute-force O(N^2) approach.
   *
   * @param {number[]} numericArray - The array for which to count inversions.
   * @returns {number} The total count of inversions found in the array.
   */
  const calculateTotalInversions = (numericArray) => {
    let currentInversionCount = 0;
    const arraySize = numericArray.length;

    // Iterate through each element with index 'i'.
    for (let i = 0; i < arraySize; i++) {
      // For each 'i', compare it with all subsequent elements with index 'j'.
      for (let j = i + 1; j < arraySize; j++) {
        // If an element at an earlier index is greater than an element at a later index,
        // it constitutes an inversion.
        if (numericArray[i] > numericArray[j]) {
          currentInversionCount++;
        }
      }
    }
    return currentInversionCount;
  };

  // --- Early Exit Condition: Check for Homogeneous Sequence ---

  // Determine if all elements in the base sequence are identical.
  // If so, no inversions are possible, and the result is always zero.
  // Using `Array.prototype.every` provides a concise way to check this condition.
  const isSequenceUniform = baseNumericSequence.every(val => val === baseNumericSequence[0]);

  if (isSequenceUniform) {
    console.log("0");
    return; // Exit early as no further calculation is needed.
  }

  // --- Calculate Initial Inversion Values ---

  // An array to store the inversion counts for different repetition factors.
  // Specifically, it will hold [Inversions(A), Inversions(A+A)].
  const computedInversionValues = [];

  // 1. Calculate inversions for the base sequence (A).
  const inversionsForSingleSequence = calculateTotalInversions(baseNumericSequence);
  computedInversionValues.push(inversionsForSingleSequence);

  // 2. Calculate inversions for the doubled sequence (A+A).
  const inversionsForDoubledSequence = calculateTotalInversions(doubledNumericSequence);
  computedInversionValues.push(inversionsForDoubledSequence);

  // --- Extrapolate for the Target Repetition Factor (K) ---

  // The problem defines a specific recurrence relation for K > 2:
  // Let I_k be the inversion count for the sequence repeated 'k' times.
  // Then I_k = I_1 + 2 * I_{k-1}
  // Where I_1 is `inversionsForSingleSequence` and I_2 is `inversionsForDoubledSequence`.

  if (targetRepetitions <= 2) {
    // If K is 1 or 2, the result is directly available from our initial calculations.
    // We use `targetRepetitions - 1` because `computedInversionValues` is 0-indexed.
    console.log(computedInversionValues[targetRepetitions - 1]);
  } else {
    // For K > 2, we iteratively apply the recurrence relation.
    // We keep track of the first term (I_1) and the most recently computed term (I_{k-1}).
    let firstTermValue = computedInversionValues[0]; // Corresponds to I_1
    let previousTermValue = computedInversionValues[1]; // Corresponds to I_2

    // Loop from the 3rd repetition up to the desired `targetRepetitions` (K).
    for (let currentRepetition = 3; currentRepetition <= targetRepetitions; currentRepetition++) {
      // Calculate the next term (I_k) using the recurrence relation.
      // Apply the modulo operation at each step to prevent integer overflow for large numbers.
      const nextTermValue = (firstTermValue + 2 * previousTermValue) % LARGE_PRIME_MODULO;

      // Update `previousTermValue` for the next iteration of the loop.
      previousTermValue = nextTermValue;
    }

    // After the loop, `previousTermValue` holds the final inversion count for `K` repetitions.
    console.log(previousTermValue);
  }
}

// --- Program Execution Entry Point ---

// This block handles reading input from the standard input stream and invoking
// the main processing function. It includes basic error handling for file operations.
try {
  // Read the entire content of the standard input file (`/dev/stdin`) as a UTF-8 string.
  const programInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  // Call the main function to process the input.
  processInputData(programInputContent);
} catch (executionError) {
  // If any error occurs during file reading or execution, log it to the console.
  console.error("An error occurred during program execution:", executionError.message);
  // For more detailed debugging, you might log the full error object:
  // console.error(executionError);
}