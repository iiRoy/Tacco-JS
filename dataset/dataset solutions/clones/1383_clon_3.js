// Function responsible for analyzing and displaying the primary lexical element.
const analyzeAndOutputFirstElement = (textualSegments) => {
  // The initial line might contain a numerical indicator, but its direct use is omitted here
  // as the core logic focuses on the sequence of textual elements.
  // The original code parsed this but never utilized it, so it's removed for conciseness.

  // Prepare the lexical elements for sorting:
  // 1. Discard the very first segment, as it's typically a metadata line (e.g., count).
  // 2. Normalize each remaining segment by removing leading/trailing whitespace.
  // 3. Exclude any segments that become empty after trimming.
  const filteredAndTrimmedUnits = textualSegments
    .slice(1) // Start from the second line, ignoring the first
    .map(unit => unit.trim()) // Clean up each unit by removing whitespace
    .filter(unit => unit.length > 0); // Keep only non-empty units

  // Implement a guard clause: if no valid units are left after processing,
  // output an error message to the standard error stream and terminate the function.
  if (filteredAndTrimmedUnits.length === 0) {
    process.stderr.write("Error: No valid lexical units found for processing.\n");
    return; // Exit early
  }

  // Sort the prepared units alphabetically (lexicographically) to determine their order.
  const lexicographicallyOrderedElements = filteredAndTrimmedUnits.sort();

  // Output the very first element from the fully sorted list to the standard output,
  // followed by a newline character for proper formatting.
  process.stdout.write(lexicographicallyOrderedElements[0] + '\n');
};

// A dynamic array used to accumulate incoming data fragments from the input stream.
let collectedDataFragments = [];

// Set up an event listener to capture 'data' events from the standard input.
// Each time a chunk of data arrives, it is added to our collection.
process.stdin.on('data', (incomingFragment) => {
  collectedDataFragments.push(incomingFragment); // Store the current data piece.
});

// Set up an event listener for the 'end' event, which signals that
// no more data is expected from the standard input stream.
process.stdin.on('end', () => {
  // Consolidate all collected data fragments into a single, comprehensive string.
  // Then, dissect this string into an array of individual lines using the newline character as a delimiter.
  const consolidatedInputLines = collectedDataFragments.join('').split('\n');

  // With the input fully prepared, invoke the main processing routine.
  analyzeAndOutputFirstElement(consolidatedInputLines);
});