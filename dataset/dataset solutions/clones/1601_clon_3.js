/**
 * This script defines a function to compute a final position based on a set of movement rules.
 * It processes input representing an initial position, the number of allowed moves, and the step distance.
 * The implementation closely mirrors a specific algorithmic approach, which may not always yield
 * the mathematically absolute minimum distance from zero, but rather replicates the provided logic.
 */

/**
 * Determines a final position on a number line based on an initial coordinate,
 * a count of permissible movements, and the magnitude of each step.
 *
 * @param {string} rawInputString - A string containing three space-separated integer values:
 *                                  the starting coordinate (x), the total number of allowed steps (k),
 *                                  and the length of each individual step (d).
 */
function CalculateFinalPosition(rawInputString) {
  // --- Data Extraction and Type Conversion ---

  // 1. Clean up the input string by removing leading/trailing whitespace,
  // then split it into an array of string tokens using space as a delimiter.
  const stringTokens = rawInputString.trim().split(" ");

  // 2. Convert each string token into its numerical equivalent.
  // Using `Number()` for explicit type conversion from string to number,
  // which handles integer parsing correctly.
  const numericValues = stringTokens.map(token => Number(token));

  // 3. Destructure the array of parsed numbers into clearly named variables
  // for improved readability and clarity throughout the function.
  let initialCoordinate = numericValues[0];
  let totalMoveCount = numericValues[1];
  let singleStepLength = numericValues[2];

  // --- Intermediate Calculations and Boolean Flags ---

  // Store the absolute value of the starting coordinate. This is frequently used
  // in conditional checks and calculations, so pre-computing it avoids repetition.
  const currentAbsolutePosition = Math.abs(initialCoordinate);

  // Estimate the approximate number of full steps required to reach or cross the origin (zero).
  // This calculation uses floating-point division, consistent with the original code's approach for 'a'.
  const estimatedMovesToOrigin = currentAbsolutePosition / singleStepLength;

  // Compute the remainder when the initial coordinate is divided by the step length.
  // This value represents the position relative to the nearest multiple of `singleStepLength`.
  const positionRemainder = initialCoordinate % singleStepLength;

  // A boolean flag to quickly check if the total number of allowed moves is an even number.
  // This simplifies conditional expressions later in the code.
  const isMoveCountEven = (totalMoveCount % 2 === 0);

  // Declare a variable to hold the final computed result.
  // This allows for a single `console.log` call at the end of the function.
  let finalResultantPosition;

  // --- Logic Branches Based on Movement Scenarios ---

  // Scenario 1: The initial coordinate is already very close to the origin.
  // This condition evaluates if the absolute value of the initial coordinate is less than a single step length.
  if (currentAbsolutePosition < singleStepLength) {
    // Sub-scenario 1.1: If an even number of moves are permitted.
    if (isMoveCountEven) {
      // With an even move count, it's possible to make pairs of forward/backward moves
      // and ultimately return to the initial starting coordinate.
      finalResultantPosition = initialCoordinate;
    } else {
      // Sub-scenario 1.2: If an odd number of moves are permitted.
      // Following the original algorithm's specific behavior for this case,
      // which is to always add the step length. (Note: if `initialCoordinate` is positive,
      // this might move further from zero, depending on the problem's exact interpretation).
      finalResultantPosition = initialCoordinate + singleStepLength;
    }
  }
  // Scenario 2: The total available moves are insufficient to reach or completely cross the origin.
  // This condition implies that the `estimatedMovesToOrigin` is strictly greater than `totalMoveCount`.
  else if (estimatedMovesToOrigin > totalMoveCount) {
    // Sub-scenario 2.1: If the initial coordinate is positive.
    if (initialCoordinate > 0) {
      // Move `totalMoveCount` steps towards the negative direction (i.e., closer to zero).
      // The absolute value is taken to represent the distance from zero.
      finalResultantPosition = Math.abs(initialCoordinate - totalMoveCount * singleStepLength);
    } else {
      // Sub-scenario 2.2: If the initial coordinate is zero or negative.
      // Move `totalMoveCount` steps towards the positive direction (i.e., closer to zero).
      // The absolute value ensures the result is a distance.
      finalResultantPosition = Math.abs(initialCoordinate + totalMoveCount * singleStepLength);
    }
  }
  // Scenario 3: Enough moves are available to reach or potentially cross the origin.
  // This is the default case, triggered when `estimatedMovesToOrigin` is less than or equal to `totalMoveCount`.
  else {
    // Sub-scenario 3.1: A specific edge case where the total move count is even
    // AND the initial coordinate is an exact multiple of the step length (meaning the remainder is zero).
    if (isMoveCountEven && positionRemainder === 0) {
      // In this particular scenario, the original logic specifically yields the `singleStepLength` itself.
      // This is a distinct behavior from simply reaching zero, which would be `0`.
      finalResultantPosition = singleStepLength;
    } else {
      // Sub-scenario 3.2: This covers all other conditions within Scenario 3
      // (either the total move count is odd, or the initial coordinate is not a multiple of the step length).
      // The original logic returns the `positionRemainder` directly.
      // This implies reaching the remainder position after initial moves towards zero,
      // and then potentially staying there even if an odd number of remaining moves are available.
      finalResultantPosition = positionRemainder;
    }
  }

  // --- Output the Final Result ---

  // Display the calculated final position to the standard output stream.
  console.log(finalResultantPosition);
}

// --- Script Entry Point ---

// Read the raw input string from the standard input stream.
// In a Node.js environment, `/dev/stdin` is typically used for this purpose.
// The 'utf8' encoding ensures proper character interpretation.
const inputDataFromStdIn = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main calculation function with the obtained input data.
CalculateFinalPosition(inputDataFromStdIn);