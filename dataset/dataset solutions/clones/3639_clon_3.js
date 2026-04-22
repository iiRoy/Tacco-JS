// Module: ComplianceEvaluator
// Purpose: Analyzes an incoming string payload against a set of predefined rules
// and determines its status, indicating whether it meets all specified criteria.
function evaluateStringForCompliance(candidateString) {
  let isCompliant = false; // Initialize the compliance status as false by default.

  // --- Initial Validation and Input Preparation ---
  // First, verify the integrity and structure of the input data.
  // The original logic implicitly requires a minimum length for its string operations
  // (e.g., 'slice(2, -3)' needs at least 5 characters to yield a non-empty string like 'C').
  const MINIMUM_PAYLOAD_SIZE = 5;
  if (typeof candidateString !== 'string' || candidateString.length < MINIMUM_PAYLOAD_SIZE) {
    // If the input is not a valid string or is too short, it cannot meet the criteria.
    console.log('WA'); // Output 'Wrong Answer' and terminate.
    return;
  }

  // Extract the character located at the very beginning of the string.
  const initialCharacter = candidateString.charAt(0);

  // Compute the total number of occurrences of the character 'C' throughout the entire string.
  // This is achieved by splitting the string by 'C' and subtracting one from the resulting array's length.
  const totalOccurrencesOfC = candidateString.split('C').length - 1;

  // Define the start and end indices for the central segment of the string.
  // This corresponds to the original `str.slice(2, -3)`.
  const centralSegmentStartIndex = 2;
  const centralSegmentEndIndex = candidateString.length - 3; // Exclusive end boundary.
  const centralStringPortion = candidateString.substring(centralSegmentStartIndex, centralSegmentEndIndex);

  // --- Rule 1: Verify the First Character ---
  // Check if the string begins with the required character 'A'.
  const startsWithRequiredLetterA = (initialCharacter === 'A');

  // --- Rule 2: Validate 'C' Placement and Count ---
  // Ensure the central portion of the string contains the character 'C'.
  const centralPortionContainsC = centralStringPortion.includes('C');

  // Confirm that there is exactly one 'C' character present in the entire string.
  const hasPreciselyOneC = (totalOccurrencesOfC === 1);

  // Combine the first two main rules. If they are both satisfied, proceed to the final check.
  if (startsWithRequiredLetterA && centralPortionContainsC && hasPreciselyOneC) {
    // --- Rule 3 (Original's Effectively Redundant Check): Final Confirmation ---
    // The original code included a condition `str.match(/[^A-Za-z]+/) !== -1`.
    // In JavaScript, `str.match(regex)` returns either an array (if a match is found) or `null` (if no match).
    // Both an array (`['x'] !== -1` evaluates to `true`) and `null` (`null !== -1` evaluates to `true`)
    // satisfy the `!== -1` comparison.
    // Consequently, this condition *always* evaluated to `true` in the original implementation,
    // making any string that reached this point automatically 'AC'.
    // To preserve this exact behavior while introducing structural change,
    // we replace it with another condition that is always logically true in this context.
    const isLengthAnInteger = (candidateString.length === Math.floor(candidateString.length)); // Always true for string lengths.

    if (isLengthAnInteger) {
      // If all conditions, including the implicitly always-passing final check, are met,
      // then the string is deemed compliant.
      isCompliant = true;
    }
  }

  // --- Final Output ---
  // Based on the determined compliance status, print 'AC' (Accepted) or 'WA' (Wrong Answer).
  console.log(isCompliant ? 'AC' : 'WA');
}

// --- Execution Environment Integration (Do not modify this segment) ---
// This part is responsible for reading the input data from the standard input stream
// and invoking the primary processing routine with the acquired payload.
evaluateStringForCompliance(require("fs").readFileSync("/dev/stdin", "utf8"));