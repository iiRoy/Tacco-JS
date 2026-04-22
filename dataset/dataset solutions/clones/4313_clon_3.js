/**
 * Expert-level Type III Code Clone Generation
 *
 * This file contains a Type III clone of an original JavaScript program.
 * Extensive modifications have been applied to achieve a high degree of divergence
 * while preserving the original functionality.
 *
 * Key changes include:
 * - Complete renaming of all functions, parameters, and local variables.
 * - Refactoring of control flow and expressions for equivalent logic.
 * - Introduction of new helper variables, constants, and intermediate steps.
 * - Addition of robust input validation and guard clauses.
 * - Deletion of unused functions and redundant statements.
 * - Reformatting of whitespace and addition of comprehensive comments.
 * - Updates to string manipulation and number parsing methods.
 */

/**
 * Extracts the next line segment from a mutable array containing a string.
 * This function modifies the first element of the input array in place by
 * removing the extracted line and the subsequent newline character.
 * It handles both LF and CRLF line endings gracefully.
 *
 * @param {string[]} mutableSourceArray - An array where the first element is the source string.
 * @returns {string} The extracted line content, or an empty string if input is invalid or exhausted.
 */
function extractNextLineSegment(mutableSourceArray) {
  // Validate the input array and its content to prevent runtime errors.
  if (!Array.isArray(mutableSourceArray) || mutableSourceArray.length === 0 || typeof mutableSourceArray[0] !== 'string') {
    return ''; // Return an empty string for invalid or exhausted input.
  }

  let fullSourceString = mutableSourceArray[0];
  const newlinePosition = fullSourceString.indexOf('\n');
  let extractedLineContent;

  if (newlinePosition !== -1) {
    // If a newline character is found, extract the substring up to it.
    extractedLineContent = fullSourceString.substring(0, newlinePosition);
    // Update the source string by removing the extracted line and the newline.
    mutableSourceArray[0] = fullSourceString.substring(newlinePosition + 1);
  } else {
    // If no newline is found, the entire remaining string is considered a single line.
    extractedLineContent = fullSourceString;
    // Clear the source string as all content has been consumed.
    mutableSourceArray[0] = '';
  }

  // Remove a trailing carriage return character if present,
  // to correctly handle Windows-style CRLF line endings.
  if (extractedLineContent.endsWith('\r')) {
    extractedLineContent = extractedLineContent.slice(0, -1);
  }

  return extractedLineContent;
}

/**
 * Solves a specific Diophantine equation problem: 4/N = 1/h + 1/n + 1/w
 * for positive integers h, n, w, given an integer N.
 * The function iterates through possible values for h and n,
 * then uses a specialized search to find w.
 *
 * @param {string} rawInputText - The raw input text, expected to contain N on the first line.
 */
function solveDiophantineEquation(rawInputText) {
  // Constants defining the search range for denominators.
  const MIN_DENOMINATOR_VALUE = 1;
  const MAX_DENOMINATOR_VALUE = 3500;
  const INITIAL_SEARCH_STEP_SIZE = Math.floor(MAX_DENOMINATOR_VALUE / 2);

  // Wrap the input string in an array for mutable string segment extraction.
  let inputLinesBuffer = [rawInputText];

  // Extract the first line which contains the value for N.
  const nStringValue = extractNextLineSegment(inputLinesBuffer);

  // Parse the extracted string into an integer. Use radix 10 for safety.
  let originalN = Number.parseInt(nStringValue, 10);

  // Input validation: Check if N is a valid positive integer.
  if (Number.isNaN(originalN) || originalN <= 0) {
    console.error("Error: Invalid or non-positive integer N provided.");
    return;
  }

  // Calculate the target sum of reciprocals (4/N).
  // This is the value that 1/h + 1/n + 1/w must equal.
  const targetReciprocalSum = 4 / originalN;

  // The original code had a dummy call to search2way here. It is removed as non-essential.
  // locateReciprocalDenominator(0.0002857959416976279, MAX_DENOMINATOR_VALUE, INITIAL_SEARCH_STEP_SIZE);

  let currentPartialReciprocalSum; // Temporary variable for 1/h + 1/n

  // Iterate through possible values for h (first denominator).
  for (let denomH = MIN_DENOMINATOR_VALUE; denomH <= MAX_DENOMINATOR_VALUE; ++denomH) {
    const reciprocalH = 1 / denomH;

    // Optimization: If 1/h alone is already greater than or equal to the target sum,
    // then adding 1/n and 1/w (which are positive) will only make it larger.
    // So, no solution is possible with this 'h'.
    if (targetReciprocalSum <= reciprocalH) {
      continue;
    }

    // Iterate through possible values for n (second denominator).
    for (let denomN = MIN_DENOMINATOR_VALUE; denomN <= MAX_DENOMINATOR_VALUE; ++denomN) {
      const reciprocalN = 1 / denomN;
      currentPartialReciprocalSum = reciprocalH + reciprocalN;

      // Optimization: If 1/h + 1/n is already greater than or equal to the target sum,
      // then adding 1/w will make it larger, so no solution is possible.
      if (targetReciprocalSum <= currentPartialReciprocalSum) {
        continue;
      }

      // Calculate the remaining reciprocal value that 1/w must equal.
      const requiredReciprocalForW = targetReciprocalSum - currentPartialReciprocalSum;

      // Use the specialized search function to find an integer 'w'.
      const foundDenomW = locateReciprocalDenominator(requiredReciprocalForW, MAX_DENOMINATOR_VALUE, INITIAL_SEARCH_STEP_SIZE);

      // If locateReciprocalDenominator returns -1, no suitable 'w' was found.
      if (foundDenomW === -1) {
        continue;
      }

      // If a 'w' is found, verify the full equation and print the solution if correct.
      // The function returns true if a solution is found and printed, terminating the program.
      if (verifySolutionAndOutput(targetReciprocalSum, denomH, denomN, foundDenomW)) {
        return; // Exit upon finding the first valid solution.
      }
    }
  }

  // If the loops complete without finding any solution, output a failure message.
  console.log("No valid integer solution (h, n, w) found within the specified constraints. NG");
}

/**
 * Performs a specialized binary-search-like process to find an integer denominator 'w'
 * such that 1/w is exactly equal to a given target fraction value.
 * This search includes unique logic to handle crossing the target value when the step size is 1.
 *
 * @param {number} targetFractionValue - The exact reciprocal value (e.g., 1/w) to search for.
 * @param {number} upperBoundValue - The maximum allowed integer value for 'w'.
 * @param {number} initialStepSize - The starting step size for adjusting 'w'.
 * @returns {number} The integer 'w' if found, otherwise -1.
 */
function locateReciprocalDenominator(targetFractionValue, upperBoundValue, initialStepSize) {
  let currentDenominatorCandidate = Math.floor(upperBoundValue / 2); // Initial guess for w
  let currentSearchStep = initialStepSize;
  // `directionLock` tracks if the search has committed to a direction with a step of 1.
  // 0: no lock, 1: last step was an increment, -1: last step was a decrement.
  let directionLock = 0;

  // The loop runs indefinitely until a solution is found or a boundary condition is met.
  // The `currentSearchStep = 1` logic ensures it doesn't get stuck with a 0 step.
  while (true) {
    const reciprocalOfCandidate = 1 / currentDenominatorCandidate;

    // Check for an exact match.
    if (targetFractionValue === reciprocalOfCandidate) {
      return currentDenominatorCandidate;
    }
    // If the target value is smaller than the current reciprocal (1/w),
    // it means 'w' is currently too small and needs to be increased.
    else if (targetFractionValue < reciprocalOfCandidate) {
      currentDenominatorCandidate += currentSearchStep;

      // If currentStep is 1 and we previously decremented, it means we've crossed the target.
      if (currentSearchStep === 1 && directionLock === -1) {
        return -1;
      }
      // If currentStep is 1 and this is the first directional move, lock the direction.
      if (currentSearchStep === 1 && directionLock === 0) {
        directionLock = 1;
      }
      // Ensure 'w' does not exceed the upper bound.
      if (currentDenominatorCandidate > upperBoundValue) {
        return -1;
      }
    }
    // If the target value is larger than the current reciprocal (1/w),
    // it means 'w' is currently too large and needs to be decreased.
    else { // targetFractionValue > reciprocalOfCandidate
      currentDenominatorCandidate -= currentSearchStep;

      // If currentStep is 1 and we previously incremented, it means we've crossed the target.
      if (currentSearchStep === 1 && directionLock === 1) {
        return -1;
      }
      // If currentStep is 1 and this is the first directional move, lock the direction.
      if (currentSearchStep === 1 && directionLock === 0) {
        directionLock = -1;
      }
      // Ensure 'w' does not go below the minimum value (1).
      if (currentDenominatorCandidate < 1) {
        return -1;
      }
    }

    // Halve the step size for the next iteration to narrow the search.
    currentSearchStep = Math.floor(currentSearchStep / 2);
    // If the step size becomes zero, reset it to 1 to ensure the search
    // can still try adjacent integer values. This is critical for finding exact matches.
    if (currentSearchStep === 0) {
      currentSearchStep = 1;
    }
  }
}

/**
 * Verifies if the sum of reciprocals for h, n, and w matches the target value.
 * If it matches, the solution (h, n, w) is printed to the console.
 *
 * @param {number} equationTarget - The target value (4/N) for the sum of reciprocals.
 * @param {number} hDenom - The first denominator.
 * @param {number} nDenom - The second denominator.
 * @param {number} wDenom - The third denominator.
 * @returns {boolean} True if the equation holds and the solution is printed, false otherwise.
 */
function verifySolutionAndOutput(equationTarget, hDenom, nDenom, wDenom) {
  // Validate that wDenom is a positive integer.
  if (wDenom <= 0) {
    return false;
  }

  // Calculate the sum of reciprocals for the current candidate values.
  const calculatedSum = (1 / hDenom) + (1 / nDenom) + (1 / wDenom);

  // Compare the calculated sum with the target value.
  // Using strict equality (===) as the problem implies exact reciprocal arithmetic.
  if (equationTarget === calculatedSum) {
    // If the equation holds, print the solution in the required format.
    console.log(`${hDenom} ${nDenom} ${wDenom}`);
    return true; // Indicate that a solution was found and handled.
  }
  return false; // Indicate that this combination is not a solution.
}

// The `isInclude` function from the original code was unused and has been removed.

// Entry point: Read input from stdin and start the main solving process.
// Using `node:fs` for clarity and `process.env.INPUT_PATH` for potential environment variable override.
solveDiophantineEquation(require("node:fs").readFileSync(process.env.INPUT_PATH || "/dev/stdin", "utf8"));