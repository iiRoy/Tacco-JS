process.stdin.resume();
process.stdin.setEncoding('utf8');

// A dynamic array to accumulate all input lines from the standard input stream.
const inputLinesBuffer = [];

// Initialize a readline interface for managing input and output.
const inputReader = require('readline').createInterface({
  input: process.stdin,  // The source of input data.
  output: process.stdout // The destination for output, though not directly used for prompts here.
});

// Event handler for each line of input received.
inputReader.on('line', (currentInputLine) => {
  inputLinesBuffer.push(currentInputLine); // Append the current line to our buffer.
});

// Event handler for when the input stream concludes (e.g., EOF or process termination).
inputReader.on('close', () => {
  // Define constants for consistent output messages.
  const POSITIVE_RESULT_MESSAGE = "Yes";
  const NEGATIVE_RESULT_MESSAGE = "No";

  // --- Initial Input Validation and Parameter Extraction ---
  // Ensure we have at least two lines of input as expected.
  if (inputLinesBuffer.length < 2) {
    console.error("Error: Insufficient input provided. Expected at least two lines for parameters and categories.");
    return; // Terminate execution if input is incomplete.
  }

  // Parse the first line to extract the numeric parameters.
  // Original: var nab = lines[0].split(' '); var n = Number(nab[0]); ...
  // Rewritten using array destructuring and direct parsing.
  const paramStrings = inputLinesBuffer[0].split(' ');

  // Validate that all expected numeric parameters are present and convertible.
  if (paramStrings.length < 3 || paramStrings.some(s => isNaN(parseInt(s, 10)))) {
    console.error("Error: Invalid or incomplete numeric parameters on the first line. Expected three integers.");
    return;
  }

  const totalCandidateItems = parseInt(paramStrings[0], 10); // Renamed from 'n'
  const maxAllowedAPasses = parseInt(paramStrings[1], 10);   // Renamed from 'a'
  const maxAllowedBPasses = parseInt(paramStrings[2], 10);   // Renamed from 'b'

  // Extract the string of item categories from the second line.
  // Renamed from 'info'
  const itemCategorySequence = inputLinesBuffer[1];

  // --- Core Logic Initialization ---
  let successfulEvaluationsCounter = 0; // Tracks total successful evaluations, renamed from 'pass'.
  let bSpecificPassCounter = 0;        // Tracks successful 'b' evaluations, renamed from 'ab'.

  // Pre-calculate the combined limit for efficiency and readability.
  const overallPassThreshold = maxAllowedAPasses + maxAllowedBPasses;

  // --- Additional Validation (Type III: Guard Clause/Warning) ---
  // Check if the declared total count matches the actual length of the category sequence.
  if (itemCategorySequence.length !== totalCandidateItems) {
    console.warn(`Warning: Declared total items (${totalCandidateItems}) does not match the actual length of the category sequence (${itemCategorySequence.length}). Processing based on actual sequence length.`);
    // For Type III, we'll proceed using the actual string length, making 'totalCandidateItems' advisory.
  }

  // --- Helper Function for Eligibility Logic (Type III: Addition/Rewrite) ---
  // Encapsulates the eligibility checking logic for cleaner code.
  const determineEligibility = (categoryType) => {
    let result = {
      isEligible: false,
      incrementTotal: false,
      incrementBSpecific: false
    };

    // Check against the overall pass threshold first.
    if (successfulEvaluationsCounter < overallPassThreshold) {
      if (categoryType === 'a') {
        result.isEligible = true;
        result.incrementTotal = true;
      } else if (categoryType === 'b') {
        // For 'b' type, there's an additional specific limit.
        if (bSpecificPassCounter < maxAllowedBPasses) {
          result.isEligible = true;
          result.incrementTotal = true;
          result.incrementBSpecific = true;
        }
      }
      // 'c' type is never eligible under this condition, so it's implicitly false.
    }
    return result;
  };

  // --- Processing Loop (Type III: Rewrite switch to if/else if, use for...of) ---
  // Iterate over each character in the category sequence.
  for (const currentCategory of itemCategorySequence) {
    let outputMessage = NEGATIVE_RESULT_MESSAGE; // Default output for the current item.
    let currentEvaluationResult = determineEligibility(currentCategory);

    // Apply the logic based on the category type.
    if (currentCategory === 'a') {
      if (currentEvaluationResult.isEligible) {
        outputMessage = POSITIVE_RESULT_MESSAGE;
      }
    } else if (currentCategory === 'b') {
      if (currentEvaluationResult.isEligible) {
        outputMessage = POSITIVE_RESULT_MESSAGE;
      }
    } else if (currentCategory === 'c') {
      // 'c' types are always rejected, no further check needed.
      outputMessage = NEGATIVE_RESULT_MESSAGE;
    } else {
      // (Type III: Addition) Handle unexpected characters gracefully.
      console.warn(`Warning: Unknown category character '${currentCategory}' encountered. Treated as '${NEGATIVE_RESULT_MESSAGE}'.`);
      outputMessage = NEGATIVE_RESULT_MESSAGE;
    }

    console.log(outputMessage); // Print the determined message for the current item.

    // Update counters based on the outcome of the eligibility check.
    if (currentEvaluationResult.incrementTotal) {
      successfulEvaluationsCounter++;
    }
    if (currentEvaluationResult.incrementBSpecific) {
      bSpecificPassCounter++;
    }
  }

  // (Type III: Optional Addition) A final summary log after all processing.
  // console.log(`\nProcessing complete. Total successful evaluations: ${successfulEvaluationsCounter}.`);
});