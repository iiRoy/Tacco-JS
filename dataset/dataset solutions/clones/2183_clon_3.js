// A dedicated utility to compute the factorial of a non-negative integer.
// This function uses a recursive approach, ensuring clarity in its definition.
// For negative inputs, it returns 0, as factorials are undefined for them.
const computeFactorialValue = (numericOperand) => {
  // Input validation: Factorial is not traditionally defined for negative numbers.
  // Returning 0 or throwing an error are common handling strategies.
  if (numericOperand < 0) {
    return 0; // Indicates an invalid input for factorial calculation in this context.
  }
  // Base case for the recursion: Factorial of 0 or 1 is always 1.
  if (numericOperand <= 1) {
    return 1;
  }
  // Recursive step: n! = n * (n-1)!
  // A temporary variable is introduced to store the result of the recursive call,
  // enhancing readability before the final multiplication.
  const resultOfPreviousStep = computeFactorialValue(numericOperand - 1);
  return numericOperand * resultOfPreviousStep;
};

// A helper function to calculate combinations (nCr) using the factorial method.
// nCr represents "n choose r" and is calculated as n! / (r! * (n-r)!).
// It incorporates guard clauses for invalid inputs and an optimization.
const calculateCombinations = (totalItemsAvailable, itemsToChoose) => {
  // Guard against impossible selections:
  // - Choosing a negative number of items.
  // - Choosing more items than are available.
  if (itemsToChoose < 0 || itemsToChoose > totalItemsAvailable) {
    return 0; // No valid combinations possible.
  }
  // Base cases:
  // - There's one way to choose 0 items (choose nothing).
  // - There's one way to choose all available items.
  if (itemsToChoose === 0 || itemsToChoose === totalItemsAvailable) {
    return 1;
  }
  // Optimization: C(n, k) is symmetric, i.e., C(n, k) = C(n, n-k).
  // This reduces computation if 'k' is greater than 'n/2'.
  if (itemsToChoose > totalItemsAvailable / 2) {
    itemsToChoose = totalItemsAvailable - itemsToChoose;
  }

  // Calculate the combination using the `computeFactorialValue` helper.
  const numeratorFactorial = computeFactorialValue(totalItemsAvailable);
  const denominatorFactorial = computeFactorialValue(itemsToChoose) * computeFactorialValue(totalItemsAvailable - itemsToChoose);

  // Safeguard against division by zero, although proper factorial/combination logic
  // with the above guards should prevent denominator from being zero.
  if (denominatorFactorial === 0) {
    return 0;
  }
  return numeratorFactorial / denominatorFactorial;
};

/**
 * A recursive function designed to count numbers (up to a given string representation)
 * that contain a specific number of non-zero digits. This is a form of digit DP.
 *
 * @param {string} targetNumberString - The upper limit number as a string.
 * @param {number} requiredNonZeroCount - The exact number of non-zero digits required.
 * @param {number} totalStringLength - The total length of `targetNumberString`.
 * @param {number} currentPositionIndex - The current digit index being processed (0-indexed).
 * @param {number} nonZeroDigitsSoFar - The count of non-zero digits accumulated up to `currentPositionIndex - 1`.
 * @param {boolean} isPrefixCurrentlyExact - True if the prefix formed so far exactly matches `targetNumberString`'s prefix.
 * @returns {number} The total number of valid patterns from this state.
 */
const determineDigitCombinations = (
  targetNumberString,
  requiredNonZeroCount,
  totalStringLength,
  currentPositionIndex,
  nonZeroDigitsSoFar,
  isPrefixCurrentlyExact
) => {
  // --- Pre-computation and Early Exit Conditions ---

  // Guard: If we've already accumulated more non-zero digits than required, this path is invalid.
  if (nonZeroDigitsSoFar > requiredNonZeroCount) {
    return 0;
  }

  // Base Case: If all digits have been processed (reached the end of the string).
  if (currentPositionIndex === totalStringLength) {
    // This path is valid only if the exact `requiredNonZeroCount` was met.
    return (nonZeroDigitsSoFar === requiredNonZeroCount) ? 1 : 0;
  }

  // Calculate remaining available slots for digits.
  const remainingAvailableSlots = totalStringLength - currentPositionIndex;
  // Guard: If there aren't enough remaining slots to potentially meet the `requiredNonZeroCount`.
  if (nonZeroDigitsSoFar + remainingAvailableSlots < requiredNonZeroCount) {
    return 0;
  }

  // Variable to accumulate the total count of valid ways from the current state.
  let waysAccumulator = 0;

  // --- Logic Branching based on `isPrefixCurrentlyExact` status ---
  if (isPrefixCurrentlyExact) {
    // We are currently constrained by the `targetNumberString`'s digits.
    const digitAtCurrentPosition = parseInt(targetNumberString[currentPositionIndex], 10);

    // Scenario 1: The current digit in `targetNumberString` is greater than zero.
    // This allows for more flexibility in placing smaller digits.
    if (digitAtCurrentPosition > 0) {
      // Sub-scenario 1.1: Place a '0' at the `currentPositionIndex`.
      // This immediately means the subsequent digits are no longer constrained by `targetNumberString`.
      // The `nonZeroDigitsSoFar` count does not change as '0' is not non-zero.
      const neededNonZerosAfterZeroPlacement = requiredNonZeroCount - nonZeroDigitsSoFar;
      const slotsAfterCurrent = totalStringLength - currentPositionIndex - 1; // Number of positions remaining after this one.

      // Validate if `neededNonZerosAfterZeroPlacement` is a possible count for combinations.
      if (neededNonZerosAfterZeroPlacement >= 0 && neededNonZerosAfterZeroPlacement <= slotsAfterCurrent) {
        // Apply the specific combination formula used in the original code: K * 9 * C(N, K) if K > 0, else 1.
        if (neededNonZerosAfterZeroPlacement === 0) {
            waysAccumulator += 1; // If 0 non-zeros needed, all remaining must be '0's.
        } else {
            const combinationsTerm = calculateCombinations(slotsAfterCurrent, neededNonZerosAfterZeroPlacement);
            waysAccumulator += neededNonZerosAfterZeroPlacement * 9 * combinationsTerm;
        }
      }

      // Sub-scenario 1.2: Place a non-zero digit 'd' from 1 up to (digitAtCurrentPosition - 1).
      // This also breaks the prefix match constraint. `nonZeroDigitsSoFar` increases by 1.
      const availableSmallerNonZeroChoices = digitAtCurrentPosition - 1; // E.g., if current is '3', choices are '1', '2'.
      if (availableSmallerNonZeroChoices > 0) { // Only proceed if there are actual smaller non-zero digits.
        const neededNonZerosAfterSmallerDigit = requiredNonZeroCount - nonZeroDigitsSoFar - 1; // -1 as this digit is non-zero.
        if (neededNonZerosAfterSmallerDigit >= 0 && neededNonZerosAfterSmallerDigit <= slotsAfterCurrent) {
            // Apply the specific combination formula.
            if (neededNonZerosAfterSmallerDigit === 0) {
                waysAccumulator += availableSmallerNonZeroChoices * 1; // All remaining are '0's.
            } else {
                const combinationsTerm = calculateCombinations(slotsAfterCurrent, neededNonZerosAfterSmallerDigit);
                waysAccumulator += availableSmallerNonZeroChoices * neededNonZerosAfterSmallerDigit * 9 * combinationsTerm;
            }
        }
      }

      // Sub-scenario 1.3: Place `digitAtCurrentPosition` itself at the current spot.
      // This maintains the `isPrefixCurrentlyExact` status as true. `nonZeroDigitsSoFar` increases by 1.
      const nextNonZeroCountIfMatched = nonZeroDigitsSoFar + 1; // `digitAtCurrentPosition` is > 0.
      waysAccumulator += determineDigitCombinations(
        targetNumberString,
        requiredNonZeroCount,
        totalStringLength,
        currentPositionIndex + 1,
        nextNonZeroCountIfMatched,
        true // Prefix remains exact.
      );
    }
    // Scenario 2: The current digit in `targetNumberString` is zero.
    // To maintain `isPrefixCurrentlyExact`, we must place a '0' here.
    // The `nonZeroDigitsSoFar` count does not change.
    else { // digitAtCurrentPosition === 0
      waysAccumulator += determineDigitCombinations(
        targetNumberString,
        requiredNonZeroCount,
        totalStringLength,
        currentPositionIndex + 1,
        nonZeroDigitsSoFar,
        true // Prefix remains exact.
      );
    }
  }
  // --- `!isPrefixCurrentlyExact` Branch: Current prefix is already smaller ---
  else {
    // The digits can be chosen freely (0-9) from `currentPositionIndex` onwards.
    // We need to fill `neededNonZerosToComplete` non-zero digits in `remainingAvailableSlots` positions.
    const neededNonZerosToComplete = requiredNonZeroCount - nonZeroDigitsSoFar;
    const slotsForFreeFill = totalStringLength - currentPositionIndex;

    if (neededNonZerosToComplete === 0) {
      // If no more non-zero digits are needed, all remaining `slotsForFreeFill` must be '0's.
      waysAccumulator = 1;
    } else if (neededNonZerosToComplete > 0 && neededNonZerosToComplete <= slotsForFreeFill) {
      // Apply the specific combination formula: K * 9 * C(N, K)
      const combinationsFactor = calculateCombinations(slotsForFreeFill, neededNonZerosToComplete);
      waysAccumulator = neededNonZerosToComplete * 9 * combinationsFactor;
    } else {
      // This case should be covered by earlier guards, but acts as a final safeguard.
      waysAccumulator = 0;
    }
  }

  return waysAccumulator;
};

// The main entry point function to process input, perform calculations, and output the result.
function processInputAndCalculate(inputData) {
  // Input validation: Check for empty or invalid input data.
  if (!inputData || inputData.trim().length === 0) {
    console.error("Error: Provided input data is empty or malformed.");
    return; // Exit if input is invalid.
  }

  // Split the raw input string into individual lines.
  const inputLines = inputData.split("\n");

  // Extract the numerical string and the target non-zero digit count.
  const numericalString = inputLines[0];
  const targetNonZeroDigitCount = parseInt(inputLines[1], 10); // Explicitly parse to integer.

  // Further validation of extracted values.
  if (isNaN(targetNonZeroDigitCount) || targetNonZeroDigitCount < 0) {
    console.error("Error: The required non-zero digit count is invalid or negative.");
    return;
  }
  if (!numericalString || numericalString.length === 0) {
    console.error("Error: The input number string is empty.");
    return;
  }

  const stringLengthOfNumber = numericalString.length;
  
  // Initiate the recursive digit combination calculation.
  // The process starts at the first digit (index 0), with no non-zero digits counted yet (0),
  // and the initial prefix is an exact match to the `numericalString`.
  const computedFinalResult = determineDigitCombinations(
    numericalString,
    targetNonZeroDigitCount,
    stringLengthOfNumber,
    0, // Starting index for digit processing.
    0, // Initial count of non-zero digits.
    true // Indicates that the prefix currently matches the target string exactly.
  );

  // Output the final calculated result to the console.
  console.log(computedFinalResult);
}

// Standard boilerplate for reading input from `/dev/stdin` in a Node.js environment.
// A try-catch block is added for robustness in file reading operations.
try {
  const fileSystemModule = require('fs');
  const fileContentFromStdin = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  processInputAndCalculate(fileContentFromStdin);
} catch (ioError) {
  console.error("An error occurred while reading from standard input:", ioError.message);
  // Depending on the application's requirements, one might exit the process here
  // or provide a default execution path.
  process.exit(1);
}