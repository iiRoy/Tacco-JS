/**
 * Processes raw string input to calculate a specific score based on character occurrences.
 * This function identifies a particular character within the initial segment of the input
 * and assigns points for each discovery, then adds a fixed base value.
 * @param {string} rawInputString - The raw string data received for processing.
 */
function calculateWeightedScore(rawInputString) {
  // Guard clause: Ensure the input is a valid string before proceeding.
  if (typeof rawInputString !== 'string') {
    console.error("Error: Input must be a string. Received type:", typeof rawInputString);
    return; // Exit or throw an error based on desired behavior
  }

  // Define key parameters as constants for clarity and easy modification.
  const CHARACTER_TO_MATCH = 'o'; // The specific character we are looking for.
  const SCORE_INCREMENT_PER_MATCH = 100; // Points awarded for each match.
  const INITIAL_BASE_SCORE = 700; // A fixed score added at the end.
  const NUMBER_OF_CHARS_TO_EXAMINE = 3; // The maximum number of initial characters to inspect.

  // Step 1: Clean and segment the input string.
  // First, remove any leading or trailing whitespace.
  const refinedString = rawInputString.trim();
  // Then, convert the cleaned string into an array of individual characters.
  const characterSegmentList = Array.from(refinedString);

  // Step 2: Extract the relevant portion for analysis.
  // We only care about the first 'NUMBER_OF_CHARS_TO_EXAMINE' characters.
  // Using slice ensures we don't go out of bounds if the string is shorter
  // than the specified examination length.
  const inspectionSegment = characterSegmentList.slice(0, NUMBER_OF_CHARS_TO_EXAMINE);

  // Step 3: Calculate the accumulated score based on character matches.
  // Use a functional approach (reduce) to iterate through the inspection segment
  // and sum up points based on character matches.
  let currentAccumulatedPoints = inspectionSegment.reduce((accumulator, currentCharacter) => {
    // Check if the current character matches our target symbol.
    if (currentCharacter === CHARACTER_TO_MATCH) {
      // If it matches, add the defined score increment to the accumulator.
      return accumulator + SCORE_INCREMENT_PER_MATCH;
    }
    // If no match, the accumulator remains unchanged for this iteration.
    return accumulator;
  }, 0); // Initialize the accumulator to zero before starting the reduction.

  // Step 4: Compute the final output value.
  // Add the initial base score to the total accumulated points from character matches.
  const finalComputedValue = INITIAL_BASE_SCORE + currentAccumulatedPoints;

  // Step 5: Display the final result to the console.
  console.log(finalComputedValue);
}

// Entry point for execution: This block handles reading input from standard
// input (common in competitive programming environments) and passes it to
// the main processing function.
try {
  // Read the entire content of /dev/stdin as a UTF-8 encoded string.
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Invoke the primary function to process the retrieved content.
  calculateWeightedScore(fileContent);
} catch (error) {
  // If there's an error during file reading (e.g., file not found, permission issues),
  // log the error message to the console.
  console.error("Failed to read input from /dev/stdin:", error.message);
  // In a production scenario, one might exit the process or provide a default value here.
}