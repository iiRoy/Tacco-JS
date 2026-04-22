// Function to evaluate a given textual sequence against specific criteria.
function analyzeSequence(rawData) {
  // Initialize a boolean flag to track overall validity.
  let isValidSequence = true;
  // Declare a string to hold the final verdict.
  let finalVerdict = 'AC'; // Assume accepted initially.

  // Convert the input string into a character array for easier manipulation.
  const charSequence = rawData.split('');
  const sequenceLength = charSequence.length;

  // --- Pre-checks and Guard Clauses ---
  // A string must have at least 3 characters to satisfy the 'C' placement rules (e.g., A c C c A).
  // If the length is less than 3, it cannot be a valid sequence.
  if (sequenceLength < 3) {
    isValidSequence = false;
  }

  // --- First Character Validation ---
  // The very first character of the sequence must be 'A'.
  // This check only proceeds if the sequence is still considered valid so far.
  if (isValidSequence && charSequence[0] !== 'A') {
    isValidSequence = false;
  }

  // --- Character Iteration and Rule Enforcement ---
  let capitalCEncountered = 0; // Counter for 'C' characters found.

  // Only proceed with detailed character checks if the sequence is still considered valid.
  if (isValidSequence) {
    // Iterate through characters from the second position (index 1) up to, but not including, the last.
    // The first character is already validated, and the last character's position is critical for 'C'.
    for (let currentIdx = 1; currentIdx < sequenceLength; currentIdx++) {
      const currentChar = charSequence[currentIdx];

      // Rule 1: Check if the current character is 'C'.
      if (currentChar === 'C') {
        capitalCEncountered++;
        // 'C' cannot be at the second position (index 1) or the last position (sequenceLength - 1).
        // Also, only one 'C' is allowed in the entire sequence.
        if (currentIdx === 1 || currentIdx === sequenceLength - 1 || capitalCEncountered > 1) {
          isValidSequence = false;
          // If a rule is broken, no need to check further characters; break the loop.
          break;
        }
      }
      // Rule 2: Check for any other uppercase letters.
      // Any character from index 1 to (length-1) that is not 'C' must be a lowercase letter.
      // This condition catches any uppercase letter that is not 'C'.
      else if (currentChar >= 'A' && currentChar <= 'Z') {
        isValidSequence = false;
        break; // Invalid character found, exit loop.
      }
      // Rule 3: All other characters are implicitly lowercase if the above checks pass.
      // No explicit 'else' block for lowercase is needed here as invalid cases are handled.
    }
  }

  // --- Post-Iteration Validation ---
  // After iterating through all relevant characters, ensure exactly one 'C' was found.
  // This check is performed only if the sequence has passed all previous validations.
  if (isValidSequence && capitalCEncountered !== 1) {
    isValidSequence = false;
  }

  // --- Final Verdict Assignment ---
  // Based on the final state of the validity flag, set the outcome indicator string.
  if (!isValidSequence) {
    finalVerdict = 'WA'; // If any rule was broken, the sequence is "Wrong Answer".
  }

  // Display the final result to the console output stream.
  console.log(finalVerdict);
}

// Do not modify this environment-specific invocation line!
// This part reads the input from standard input and passes it to the main processing function.
analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));