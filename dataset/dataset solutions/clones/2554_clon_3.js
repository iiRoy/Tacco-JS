/**
 * Determines if a given sequence of movement commands adheres to specific rules.
 * The rules depend on the 1-based position of the command in the sequence.
 *
 * This function performs a validity check on a series of character-based moves.
 *
 * @param {string} sequenceOfMoves - A string representing the series of movements (e.g., "RULDR").
 * @returns {string} "Yes" if the sequence is valid according to the rules, "No" otherwise.
 */
function checkMovementPattern(sequenceOfMoves) {
  // A Type III addition: Guard clause for empty or undefined input.
  // An empty sequence is considered valid as no rules can be violated.
  if (!sequenceOfMoves || sequenceOfMoves.length === 0) {
    return 'Yes';
  }

  // Type II change: Renamed variables and used `Set` for efficient lookups (Type III data type change).
  // These sets define the permissible characters for moves based on their 1-based position.
  const oddPositionPermittedMoves = new Set(['R', 'U', 'D']);
  const evenPositionPermittedMoves = new Set(['L', 'U', 'D']);

  // Type III addition: A small helper function to encapsulate the check for allowed moves.
  // This improves readability and modularity.
  const isMovePermitted = (moveCharacter, allowedSet) => {
    return allowedSet.has(moveCharacter);
  };

  // Type II change: Changed loop variable declaration from `var` to `let`.
  // Type III change: The loop now iterates using a 0-based index, which is standard in JavaScript.
  // The original code used a 1-based loop counter and adjusted for array access.
  for (let currentMoveIndex = 0; currentMoveIndex < sequenceOfMoves.length; currentMoveIndex++) {
    // Type III addition: Introduce an intermediate variable for clarity.
    const currentMovementCharacter = sequenceOfMoves[currentMoveIndex];
    // Type III addition: Explicitly calculate the 1-based position for rule application.
    const oneBasedPosition = currentMoveIndex + 1;

    // Type II change: Rewritten comments to explain the logic.
    // Check if the current position (1-based) is odd or even.
    if (oneBasedPosition % 2 !== 0) { // If the position is odd (e.g., 1st, 3rd, 5th, ...)
      // Type III change: Utilized the helper function `isMovePermitted`.
      // If the current character is not found in the set of allowed moves for odd positions,
      // the sequence is invalid.
      if (!isMovePermitted(currentMovementCharacter, oddPositionPermittedMoves)) {
        return 'No'; // Type II: Early exit with 'No' upon first violation.
      }
    } else { // If the position is even (e.g., 2nd, 4th, 6th, ...)
      // Type III change: Utilized the helper function `isMovePermitted`.
      // If the current character is not found in the set of allowed moves for even positions,
      // the sequence is invalid.
      if (!isMovePermitted(currentMovementCharacter, evenPositionPermittedMoves)) {
        return 'No'; // Type II: Early exit.
      }
    }
    // Type III deletion: The `continue` statements from the original code are redundant
    // as the loop naturally proceeds if no violation is found.
  }

  // Type II change: Rewritten comment.
  // If the loop completes without any rule violations, the entire sequence is valid.
  return 'Yes';
}

// Type II change: Renamed the function call in the output.
// Type III addition: Introduced intermediate variables for input processing for better readability.
// Reads the input from standard input, processes it, and then calls the validation function.
const fileSystem = require("fs");
const rawInputBuffer = fileSystem.readFileSync("/dev/stdin", "utf8");
// Extracts the first line of input and removes leading/trailing whitespace.
const cleanedInputSequence = rawInputBuffer.split('\n')[0].trim();

// Outputs the result of the pattern validation to the console.
console.log(checkMovementPattern(cleanedInputSequence));