const retrieveSystemInput = () => {
  // Reads all input from standard input, decodes it as UTF-8, and removes leading/trailing whitespace.
  // This function is specific to Node.js environments running on systems with /dev/stdin.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
};

const sendOutputToConsole = (valueToDisplay) => {
  // Prints the given value to the console, typically standard output.
  console.log(valueToDisplay);
};

// --- Input Conversion Type Definitions (Type III: Added constants for clarity) ---
const InputTransformationMode = {
  PRESERVE_AS_STRING: 0, // No conversion, return as is.
  CONVERT_TO_INTEGER: 1, // Convert the string to a base-10 integer.
  SPLIT_BY_SPACE_DELIMITER: 2, // Split string by space into an array of strings.
  SPLIT_BY_NEWLINE_DELIMITER: 3, // Split string by newline into an array of strings.
  SPLIT_SPACE_TO_NUMBERS: 4, // Split by space, then convert each part to a number.
  SPLIT_NEWLINE_TO_NUMBERS: 5, // Split by newline, then convert each part to a number.
  SPLIT_INTO_INDIVIDUAL_CHARS: 6, // Split string into an array of single-character strings.
  SPLIT_CHARS_TO_NUMBERS: 7, // Split into characters, then convert each character to a number.
};

// --- Input Parsing Utility (Type II: Renamed, Type III: Enhanced with error handling) ---
function transformInputString(sourceString, transformationMode) {
  // This helper function handles various ways to parse and convert input strings.
  // It's designed to make input processing flexible and reusable.
  if (typeof sourceString !== 'string') {
      console.error("Error: transformInputString expects a string as its first argument.");
      return sourceString; // Return original if not a string
  }

  switch (transformationMode) {
    case InputTransformationMode.PRESERVE_AS_STRING:
      return sourceString;
    case InputTransformationMode.CONVERT_TO_INTEGER:
      // Using Number() for broader type conversion capability (e.g., floats, more consistent with map(Number))
      return Number(sourceString);
    case InputTransformationMode.SPLIT_BY_SPACE_DELIMITER:
      return sourceString.split(" ");
    case InputTransformationMode.SPLIT_BY_NEWLINE_DELIMITER:
      return sourceString.split("\n");
    case InputTransformationMode.SPLIT_SPACE_TO_NUMBERS:
      return sourceString.split(" ").map((item) => Number(item));
    case InputTransformationMode.SPLIT_NEWLINE_TO_NUMBERS:
      return sourceString.split("\n").map((item) => Number(item));
    case InputTransformationMode.SPLIT_INTO_INDIVIDUAL_CHARS:
      return sourceString.split("");
    case InputTransformationMode.SPLIT_CHARS_TO_NUMBERS:
      return sourceString.split("").map((item) => Number(item));
    default:
      // Type III: Added robust error handling for unknown transformation modes.
      console.warn(`Warning: Unknown transformation mode '${transformationMode}'. Returning input string as-is.`);
      return sourceString;
  }
}

// --- Debugging Utility (Type III: New fragment for conditional logging) ---
const IS_DEBUG_ACTIVE = false; // Toggle this to enable/disable debug messages.
const logDebugMessage = (...messages) => {
  if (IS_DEBUG_ACTIVE) {
    console.debug("[DEBUG INFO]", ...messages);
  }
};

// --- Core Challenge Processing Logic (Type II: Renamed, Type III: Extensive structural changes) ---
function executeProblemSolver(rawInputContent) {
  logDebugMessage("Starting execution for provided input.");

  // Type III: Guard clause for empty input.
  if (!rawInputContent || rawInputContent.length === 0) {
    logDebugMessage("Received empty input. Outputting 0.");
    sendOutputToConsole(0);
    return;
  }

  // Type II: Renamed variable for clarity.
  // Type III: Input parsed into lines using the enhanced utility.
  const inputDataLines = transformInputString(rawInputContent, InputTransformationMode.SPLIT_BY_NEWLINE_DELIMITER);
  logDebugMessage("Input lines parsed:", inputDataLines);

  // Type II: Renamed N to numberOfElements.
  // Type III: Explicitly checking for the existence of the first line.
  if (inputDataLines.length < 1) {
    logDebugMessage("Input data missing expected first line for number of elements. Outputting 0.");
    sendOutputToConsole(0);
    return;
  }
  const numberOfElements = transformInputString(inputDataLines[0], InputTransformationMode.CONVERT_TO_INTEGER);
  logDebugMessage("Determined number of elements (N):", numberOfElements);

  // Type III: Validation for numberOfElements.
  if (isNaN(numberOfElements) || numberOfElements < 1) {
    logDebugMessage(`Invalid number of elements '${numberOfElements}'. Expected a positive integer. Outputting 0.`);
    sendOutputToConsole(0);
    return;
  }

  // Type II: Renamed list to mainSequence.
  // Type III: Explicitly checking for the existence of the second line.
  if (inputDataLines.length < 2) {
    logDebugMessage("Input data missing expected second line for sequence. Outputting 0.");
    sendOutputToConsole(0);
    return;
  }
  const mainSequence = transformInputString(inputDataLines[1], InputTransformationMode.SPLIT_SPACE_TO_NUMBERS);
  logDebugMessage("Main sequence (list) parsed:", mainSequence);

  // Type III: Validation and adjustment for sequence length mismatch.
  let effectiveProcessingSize = numberOfElements;
  if (mainSequence.length < numberOfElements) {
    logDebugMessage(`Warning: Main sequence length (${mainSequence.length}) is less than declared N (${numberOfElements}). Processing up to actual sequence length.`);
    effectiveProcessingSize = mainSequence.length; // Adjust N to prevent out-of-bounds access
  } else if (mainSequence.length > numberOfElements) {
    logDebugMessage(`Warning: Main sequence length (${mainSequence.length}) is greater than declared N (${numberOfElements}). Extra elements will be ignored.`);
    // No adjustment needed here as loops will naturally stop at numberOfElements.
  }

  // Type II: Renamed tmpList to indicatorArray.
  // Type III: Using Array.from for initialization, functionally equivalent to 'new Array(N).fill(0)'.
  const indicatorArray = Array.from({ length: numberOfElements }, () => 0);
  logDebugMessage("Initialized indicator array:", indicatorArray);

  // First Pass: Populate indicatorArray
  // Type II: Renamed loop variable 'i' to 'currentIndex'.
  // Type III: Added an inline helper function `isCorrectlyPositioned` for readability and reusability.
  const isCorrectlyPositioned = (value, index) => value === index + 1;
  for (let currentIndex = 0; currentIndex < effectiveProcessingSize; currentIndex++) {
    // Type III: Added an explicit check for `mainSequence` bounds.
    if (currentIndex < mainSequence.length && isCorrectlyPositioned(mainSequence[currentIndex], currentIndex)) {
      indicatorArray[currentIndex] = 1;
    }
  }
  logDebugMessage("Populated indicator array after first pass:", indicatorArray);

  // Type II: Renamed 'output' to 'correctSegmentCount'.
  let correctSegmentCount = 0;

  // --- Type III: Completely rewritten the second loop's conditional logic for clarity and efficiency ---
  // The original complex if/else if structure is simplified into a more direct segment counting approach.

  // Handle the very first element as a potential segment start.
  // If the array is not empty and the first element is 1, it constitutes a segment start.
  if (numberOfElements > 0 && indicatorArray[0] === 1) {
    correctSegmentCount++;
    logDebugMessage(`Segment initiated at index 0. Current count: ${correctSegmentCount}`);
  }

  // Iterate from the second element onwards to find subsequent segment starts.
  // A new segment begins if the current element is 1 AND the immediately preceding element was 0.
  for (let currentIndex = 1; currentIndex < numberOfElements; currentIndex++) {
    const previousElementStatus = indicatorArray[currentIndex - 1]; // Type II: Renamed mae
    const currentElementStatus = indicatorArray[currentIndex];     // Type II: Renamed ato

    if (currentElementStatus === 1 && previousElementStatus === 0) {
      correctSegmentCount++;
      logDebugMessage(`New segment detected at index ${currentIndex} (0 -> 1 transition). Current count: ${correctSegmentCount}`);
    }
  }
  // --- End of Type III rewritten logic ---

  // Type II: Renamed myout to sendOutputToConsole.
  sendOutputToConsole(correctSegmentCount);
  logDebugMessage("Final correct segment count:", correctSegmentCount);
}

// Type III: Added a check to ensure the main function is called only when the script is executed directly.
// This makes the script more modular if it were to be imported as a module.
if (require.main === module) {
  executeProblemSolver(retrieveSystemInput());
}