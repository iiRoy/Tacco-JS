function ProcessGameOutcome(inputPayload) {
  // Guard against invalid or empty input strings at the very beginning.
  if (!inputPayload || typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
    console.error("Input processing aborted: Provided data is either empty or not a valid string.");
    return; // Terminate execution for bad input.
  }

  // Split the entire input block into individual lines.
  // Using a regex to handle both Windows (\r\n) and Unix (\n) line endings,
  // and then filtering out any potential empty strings that might result from extra newlines.
  const parsedTextLines = inputPayload.split(/\r?\n/).filter(line => line.trim().length > 0);

  // Define the minimum number of distinct data lines required for the logic to proceed.
  const MINIMUM_DATA_SECTIONS = 3;

  // Validate that we have enough lines to perform the necessary operations.
  if (parsedTextLines.length < MINIMUM_DATA_SECTIONS) {
    console.error(`Data error: Expected at least ${MINIMUM_DATA_SECTIONS} lines, but only received ${parsedTextLines.length}.`);
    return; // Exit if critical data is missing.
  }

  // Extract and tokenise the first line, which typically contains identifiers or names.
  // Split by any sequence of whitespace characters and remove empty tokens.
  const primaryEntityTokens = parsedTextLines[0].split(/\s+/).filter(Boolean);

  // Extract and parse the second line, which holds numerical values (e.g., scores or counters).
  // Each token is converted to an integer; non-numeric values default to zero with a warning.
  const currentNumericTallies = parsedTextLines[1].split(/\s+/).filter(Boolean).map(scoreString => {
    const numericValue = parseInt(scoreString, 10);
    if (isNaN(numericValue)) {
      console.warn(`Encountered non-numeric tally: '${scoreString}'. Defaulting to 0 for this entry.`);
      return 0; // Provide a default in case of parsing failure.
    }
    return numericValue;
  });

  // The third line provides a specific comparison token or event trigger.
  const comparisonTriggerValue = parsedTextLines[2].trim();

  // Ensure that we have at least two numerical tallies to modify.
  const REQUIRED_TALLY_COUNT = 2;
  if (currentNumericTallies.length < REQUIRED_TALLY_COUNT) {
    console.error(`Tally data incomplete: Expected ${REQUIRED_TALLY_COUNT} numerical entries, but found ${currentNumericTallies.length}.`);
    return; // Abort if score data is malformed.
  }

  // Retrieve the first token from the primary entity line for the comparison.
  // Default to an empty string if the token list is unexpectedly empty.
  const mainCandidateIdentifier = primaryEntityTokens[0] || '';

  // --- Core Decision Logic ---
  // This block determines which of the two tallies needs to be decremented.
  // The decision hinges on whether the main candidate identifier matches the comparison trigger value.
  if (mainCandidateIdentifier === comparisonTriggerValue) {
    // If there's a match, the first tally (at index 0) is reduced by one unit.
    currentNumericTallies[0] -= 1;
  } else {
    // If there's no match, the second tally (at index 1) is reduced by one unit.
    currentNumericTallies[1] -= 1;
  }

  // Prepare the final output string by joining the modified tallies with a space.
  const formattedResultString = `${currentNumericTallies[0]} ${currentNumericTallies[1]}`;

  // Output the computed result to the standard console.
  console.log(formattedResultString);
}

// Global execution wrapper for reading input from the standard input stream.
// This ensures the function is called with data when the script is run.
try {
  // Attempt to read all content from /dev/stdin (common for competitive programming).
  // Specifying 'utf8' encoding for proper character interpretation.
  const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

  // Invoke the main processing function with the obtained input.
  ProcessGameOutcome(rawSystemInput);
} catch (ioError) {
  // Catch and report any errors that occur during file reading,
  // indicating a problem with input acquisition rather than logic.
  console.error("Input reading failed: Could not retrieve data from /dev/stdin. Details:", ioError.message);
}