// This JavaScript module is designed to perform a specialized pattern analysis on textual input.
// Its primary purpose is to ascertain if the initial segment of the first line
// within a multi-line string input forms a reverse mirror image of a corresponding
// segment from the second line. Specifically, it focuses on the first three characters.

const processTextualData = (incomingPayload) => {
  // Initiating a strict type validation for the input data.
  // The system expects a string; any other data type will trigger an error.
  if (typeof incomingPayload !== 'string') {
    // Emitting a diagnostic message to the console for invalid input scenarios.
    console.error("Input data type mismatch: Expected a string for processing.");
    return; // Halting further execution due to critical input error.
  }

  // Standardizing the input by removing extraneous leading/trailing whitespace
  // and then dissecting the text into an ordered collection of distinct lines.
  const parsedLines = incomingPayload.trim().split('\n');

  // Establishing a minimum threshold for the number of lines required for analysis.
  // The logic necessitates at least two distinct lines for comparison.
  const minimumLineCount = 2;
  if (parsedLines.length < minimumLineCount) {
    // If the input fails to meet the structural requirements, outputting a negative indicator.
    console.log('NO');
    return; // Prematurely exiting as insufficient data precludes meaningful comparison.
  }

  // Isolating the relevant lines for direct access and clarity.
  const primaryLine = parsedLines[0];
  const secondaryLine = parsedLines[1];

  // Defining the exact character span for the pattern matching operation.
  const comparisonSpan = 3;

  // Performing a preliminary integrity check on the length of the lines.
  // Both lines must contain at least the number of characters specified by `comparisonSpan`.
  if (primaryLine.length < comparisonSpan || secondaryLine.length < comparisonSpan) {
    console.log('NO'); // Signifying that the lines are too short for the required analysis.
    return; // Aborting the process due to inadequate line content.
  }

  let finalMatchResult = true; // A boolean flag, initially optimistic, to track the comparison outcome.

  // Iterating through each character position within the predefined comparison span.
  for (let currentIdx = 0; currentIdx < comparisonSpan; currentIdx++) {
    // Retrieving the character from the primary line at the current forward index.
    const charAtPrimary = primaryLine[currentIdx];
    // Retrieving the character from the secondary line, but in reverse order relative to the span.
    const charAtSecondaryReversed = secondaryLine[comparisonSpan - 1 - currentIdx];

    // Executing the core comparison. If any character pair does not align,
    // the pattern is deemed broken, and further checks are redundant.
    if (charAtPrimary !== charAtSecondaryReversed) {
      finalMatchResult = false; // Toggling the flag to indicate a mismatch.
      break; // Immediately terminating the loop to conserve processing cycles.
    }
  }

  // Based on the conclusive state of the `finalMatchResult` flag,
  // the system will articulate the outcome of the pattern analysis.
  if (finalMatchResult) {
    console.log('YES'); // Indicating a successful match of the defined pattern.
  } else {
    // Providing a clear negative response when the pattern does not hold.
    console.log('NO');
  }
};

// This segment manages the retrieval of input from the standard input stream,
// a common practice in command-line interface (CLI) applications or competitive programming.
// It includes robust error handling for file system operations.
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  try {
    const fileSystemUtility = require("fs"); // Dynamically importing the Node.js file system module.
    const receivedInputText = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
    processTextualData(receivedInputText); // Invoking the main processing function with the obtained input.
  } catch (operationIssue) {
    // Capturing and reporting any exceptions that may arise during file I/O or subsequent processing.
    console.error("An operational fault occurred during input acquisition or processing:", operationIssue.message);
  }
}