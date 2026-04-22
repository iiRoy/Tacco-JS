'use strict';

// Enable or disable detailed debugging messages based on an environment variable.
// This allows for optional introspection into the clone's execution flow.
const ENABLE_DEBUG_LOGGING = process.env.CLONE_DEBUG === 'true';

// --- Input Acquisition and Initial Parsing ---

// The 'fs' module is used for file system operations, specifically for reading standard input.
// We read the entire content of '/dev/stdin' as a Buffer, then convert it to a UTF-8 string.
let fileSystemModule = require('fs');
let rawInputBufferContent = fileSystemModule.readFileSync('/dev/stdin');
let decodedInputText = rawInputBufferContent.toString('utf8');

// Defensive check: Ensure the input text is not empty or just whitespace.
// While competitive programming usually guarantees valid input, robust code would handle this.
if (!decodedInputText || decodedInputText.trim().length === 0) {
  if (ENABLE_DEBUG_LOGGING) {
    console.error("DEBUG: Input stream appears empty or contains only whitespace. Proceeding with caution or default values.");
  }
  // In a production scenario, one might throw an error or exit here.
  // For this cloning exercise, we'll assume subsequent lines exist as per original.
}

// Split the comprehensive input text into an array of individual lines.
const parsedInputLines = decodedInputText.split('\n');

// The original problem statement might include a numerical parameter on the first line (e.g., N),
// but this particular snippet's core logic does not utilize it.
// Therefore, we omit parsing it to reduce non-essential code fragments.
// Original code had: const N = +lines[0]; This is now removed as N was unused.

// The critical string sequence for processing is located on the second line of input.
let initialCharacterSequence = parsedInputLines[1];

// A guard clause for the primary input string.
if (typeof initialCharacterSequence !== 'string' || initialCharacterSequence === undefined) {
    if (ENABLE_DEBUG_LOGGING) {
        console.error("DEBUG: Primary character sequence is undefined or not a string. Using an empty string for safety.");
    }
    // Fallback to an empty string to prevent runtime errors in subsequent steps.
    initialCharacterSequence = '';
}


// --- Iterative Parenthesis Reduction Process ---

// This variable holds the string that is actively being modified
// by removing balanced '()' pairs. It starts as a copy of the initial sequence.
let currentMutableStringState = initialCharacterSequence;

// Variables to keep track of the string's length before and after each replacement pass.
// This is crucial for determining if any '()' pairs were successfully removed in an iteration.
let lengthBeforeReductionPass = 0;
let lengthAfterReductionPass = currentMutableStringState.length;

// Define the regular expression for finding and replacing balanced adjacent parentheses.
// Using a constant for clarity and potential performance benefits if used multiple times.
const ADJACENT_PAREN_REGEX = /\(\)/g;

// Begin a loop that repeatedly removes all occurrences of "()" from the string.
// The loop continues as long as the string's length changes, indicating that
// at least one "()" pair was removed in the previous iteration.
do {
  lengthBeforeReductionPass = lengthAfterReductionPass; // Record the length before current pass
  currentMutableStringState = currentMutableStringState.replace(ADJACENT_PAREN_REGEX, ''); // Execute replacement
  lengthAfterReductionPass = currentMutableStringState.length; // Update length after current pass

  if (ENABLE_DEBUG_LOGGING) {
    console.log(`DEBUG: Reduction pass completed. Current state: '${currentMutableStringState}', new length: ${lengthAfterReductionPass}`);
  }

} while (lengthBeforeReductionPass !== lengthAfterReductionPass); // Loop until no more '()' can be removed

// --- Computation of Required Balancing Parentheses ---

// After the reduction loop, 'currentMutableStringState' contains only unmatched
// '(' and ')' characters (e.g., "(((" or ")))" or "()(" etc., but no "()" adjacent pairs).
// We now need to calculate how many '(' should prepend and ')' should append
// to the *original* sequence to make it balanced.

// To count the number of unmatched left parentheses, we remove all ')' characters
// from the reduced string. The length of the result is our count.
let stringWithoutRightParens = currentMutableStringState.replace(/\)/g, '');
const countOfRequiredLeadingOpenParens = stringWithoutRightParens.length;

// The count of required trailing right parentheses is the total length of the
// reduced string minus the count of left parentheses we just determined.
const countOfRequiredTrailingCloseParens = currentMutableStringState.length - countOfRequiredLeadingOpenParens;

// --- Final Output Construction and Display ---

// Generate the string segment consisting of only opening parentheses,
// repeated the calculated number of times.
const generatedPrefix = '('.repeat(countOfRequiredLeadingOpenParens);

// Generate the string segment consisting of only closing parentheses,
// repeated the calculated number of times.
const generatedSuffix = ')'.repeat(countOfRequiredTrailingCloseParens);

// Concatenate the generated prefix, the original input sequence, and the generated suffix.
// This forms the final, balanced parenthesis string.
const finalBalancedOutputString = generatedPrefix + initialCharacterSequence + generatedSuffix;

// Display the resulting string to standard output.
console.log(finalBalancedOutputString);