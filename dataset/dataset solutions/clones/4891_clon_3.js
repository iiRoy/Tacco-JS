const STANDARD_INPUT_PATH = "/dev/stdin";

const DATA_TRANSFORMATION_MODES = {
  TO_INTEGER: 1,
  SPLIT_BY_SPACE: 2,
  SPLIT_BY_NEWLINE: 3,
  SPLIT_SPACE_TO_NUMBERS: 4,
  SPLIT_NEWLINE_TO_NUMBERS: 5,
  SPLIT_TO_CHARS: 6,
  SPLIT_CHARS_TO_NUMBERS: 7,
  JOIN_BY_SPACE: 8,
  JOIN_BY_NEWLINE: 9,
  JOIN_NO_DELIMITER: 0,
  TRIM_ARRAY_ELEMENTS: 10
};

/**
 * Safely retrieves raw text content from the standard input stream.
 * Includes error handling for file system operations and checks for empty content.
 * @returns {string} The trimmed content read from standard input, or an empty string on error/no content.
 */
function retrieveSystemInput() {
  let fetchedData = "";
  try {
    fetchedData = require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8").trim();
  } catch (ioError) {
    reportCriticalError(`FILE_READ_FAILURE: Could not access standard input file at "${STANDARD_INPUT_PATH}". Details: ${ioError.message}`);
    return "";
  }

  if (fetchedData.length === 0) {
    logDiagnosticMessage("INPUT_WARNING: Standard input stream was empty after initial processing.");
  }
  return fetchedData;
}

/**
 * Outputs a specified value to the standard output stream, appending a newline character.
 * @param {any} valueToPrint The data to be written to standard output.
 */
function publishResult(valueToPrint) {
  process.stdout.write(`${valueToPrint}\n`);
}

/**
 * Logs a diagnostic message to the standard error stream. This is typically for non-critical information
 * and can be conditionally enabled based on environment settings.
 * @param {string} message The diagnostic message string.
 */
function logDiagnosticMessage(message) {
  if (process.env.ENABLE_DEBUG_LOGS === 'true') {
    process.stderr.write(`[DIAGNOSTIC] ${message}\n`);
  }
}

/**
 * Reports a critical error message to the standard error stream.
 * This function should be used for significant errors that prevent normal operation.
 * @param {string} errorMessage The error message string.
 */
function reportCriticalError(errorMessage) {
  process.stderr.write(`[CRITICAL_ERROR] ${errorMessage}\n`);
}

/**
 * Transforms an input value based on a specified conversion mode.
 * Provides various utility conversions including parsing, splitting, joining, and mapping to numbers.
 * Includes robust validation and error reporting for transformation failures.
 * @param {any} inputValue The data to be transformed.
 * @param {number} modeOfConversion An integer code specifying the desired transformation.
 * @returns {any} The transformed value, or the original value/a default if transformation fails.
 */
function applyDataTransformation(inputValue, modeOfConversion) {
  if (inputValue === null || inputValue === undefined) {
    logDiagnosticMessage("TRANSFORMATION_WARNING: Attempted conversion on null/undefined input. Returning original value.");
    return inputValue;
  }

  const inputAsString = String(inputValue); // Coerce to string for splitting/parsing operations.

  switch (modeOfConversion) {
    case DATA_TRANSFORMATION_MODES.TO_INTEGER:
      const numValue = parseInt(inputAsString, 10);
      if (isNaN(numValue)) {
        reportCriticalError(`TRANSFORMATION_ERROR: Input "${inputAsString}" could not be parsed as an integer. Defaulting to 0.`);
        return 0;
      }
      return numValue;

    case DATA_TRANSFORMATION_MODES.SPLIT_BY_SPACE:
      return inputAsString.split(" ");

    case DATA_TRANSFORMATION_MODES.SPLIT_BY_NEWLINE:
      return inputAsString.split("\n");

    case DATA_TRANSFORMATION_MODES.SPLIT_SPACE_TO_NUMBERS:
      return inputAsString.split(" ").map(element => {
        const parsedNum = Number(element);
        if (isNaN(parsedNum)) {
          logDiagnosticMessage(`TRANSFORMATION_WARNING: Non-numeric element "${element}" encountered during space-split to numbers. Result will contain NaN.`);
        }
        return parsedNum;
      });

    case DATA_TRANSFORMATION_MODES.SPLIT_NEWLINE_TO_NUMBERS:
      return inputAsString.split("\n").map(element => {
        const parsedNum = Number(element);
        if (isNaN(parsedNum)) {
          logDiagnosticMessage(`TRANSFORMATION_WARNING: Non-numeric element "${element}" encountered during newline-split to numbers. Result will contain NaN.`);
        }
        return parsedNum;
      });

    case DATA_TRANSFORMATION_MODES.SPLIT_TO_CHARS:
      return inputAsString.split("");

    case DATA_TRANSFORMATION_MODES.SPLIT_CHARS_TO_NUMBERS:
      return inputAsString.split("").map(charElement => {
        const parsedNum = Number(charElement);
        if (isNaN(parsedNum)) {
          logDiagnosticMessage(`TRANSFORMATION_WARNING: Non-numeric character "${charElement}" encountered during char-split to numbers. Result will contain NaN.`);
        }
        return parsedNum;
      });

    case DATA_TRANSFORMATION_MODES.JOIN_BY_SPACE:
      return Array.isArray(inputValue) ? inputValue.join(" ") : inputAsString;

    case DATA_TRANSFORMATION_MODES.JOIN_BY_NEWLINE:
      return Array.isArray(inputValue) ? inputValue.join("\n") : inputAsString;

    case DATA_TRANSFORMATION_MODES.JOIN_NO_DELIMITER:
      return Array.isArray(inputValue) ? inputValue.join("") : inputAsString;

    case DATA_TRANSFORMATION_MODES.TRIM_ARRAY_ELEMENTS:
        if (Array.isArray(inputValue)) {
            return inputValue.map(element => typeof element === 'string' ? element.trim() : element);
        }
        logDiagnosticMessage("TRANSFORMATION_WARNING: Attempted to trim elements of a non-array. Returning original input.");
        return inputValue;

    default:
      reportCriticalError(`TRANSFORMATION_ERROR: Unsupported conversion mode "${modeOfConversion}". Returning original input value.`);
      return inputValue;
  }
}

/**
 * The core logic function responsible for processing the program's input.
 * It determines the minimal length of a combined string formed by two input strings
 * with maximal possible overlap.
 * @param {string} incomingContent The raw string data received from the input source.
 */
function executeMainProcessing(incomingContent) {
  // Initial validation of the incoming raw data.
  if (typeof incomingContent !== 'string' || incomingContent.trim().length === 0) {
    reportCriticalError("PROCESSING_ABORT: Invalid or empty input content provided. Cannot proceed.");
    publishResult(0);
    return;
  }

  // Split the raw content into individual lines and trim whitespace from each.
  let contentSegments = applyDataTransformation(incomingContent, DATA_TRANSFORMATION_MODES.SPLIT_BY_NEWLINE);
  contentSegments = applyDataTransformation(contentSegments, DATA_TRANSFORMATION_MODES.TRIM_ARRAY_ELEMENTS);

  // Verify that the required number of input lines (N, S, T) are present.
  const EXPECTED_MIN_LINES = 3;
  if (contentSegments.length < EXPECTED_MIN_LINES) {
    reportCriticalError(`PROCESSING_ABORT: Insufficient input lines. Expected at least ${EXPECTED_MIN_LINES}, but received ${contentSegments.length}.`);
    publishResult(0);
    return;
  }

  // Parse the initial length parameter from the first line.
  const nominalStringLength = applyDataTransformation(contentSegments[0], DATA_TRANSFORMATION_MODES.TO_INTEGER);

  // Validate the parsed length to ensure it's a positive integer.
  if (isNaN(nominalStringLength) || nominalStringLength <= 0) {
    reportCriticalError(`PROCESSING_ABORT: The nominal string length ("${contentSegments[0]}") is invalid. Must be a positive integer.`);
    publishResult(0);
    return;
  }

  // Assign the two primary strings from the input segments.
  const primaryString = contentSegments[1];
  const secondaryString = contentSegments[2];

  // Additional check to ensure string lengths match the nominal length.
  if (primaryString.length !== nominalStringLength || secondaryString.length !== nominalStringLength) {
    reportCriticalError(`PROCESSING_ABORT: Mismatch in string lengths. Expected ${nominalStringLength} for both, but got ${primaryString.length} and ${secondaryString.length}.`);
    publishResult(0);
    return;
  }
  
  // Optimization: If the strings are identical, the combined length is just the length of one string.
  if (primaryString === secondaryString) {
    publishResult(nominalStringLength);
    return;
  }

  let finalCombinedLength = nominalStringLength * 2; // Initialize to maximum possible length (no overlap).

  // Iterate to find the largest possible overlap.
  // The loop variable `suffixStartIndex` represents the starting index of the suffix in `primaryString`
  // that we are comparing against prefixes of `secondaryString`.
  // A suffixStartIndex of 1 means the suffix starts at index 1 (second character), implying an overlap of N-1 characters.
  for (let suffixStartIndex = 1; suffixStartIndex <= nominalStringLength; suffixStartIndex++) {
    const currentOverlapLength = nominalStringLength - suffixStartIndex;
    
    // Extract the suffix part from the primary string.
    const suffixCandidate = primaryString.substring(suffixStartIndex);

    // Extract the prefix part from the secondary string with the same length.
    const prefixCandidate = secondaryString.substring(0, currentOverlapLength);

    logDiagnosticMessage(`Overlap check for index ${suffixStartIndex}: Suffix="${suffixCandidate}" (len=${suffixCandidate.length}), Prefix="${prefixCandidate}" (len=${prefixCandidate.length})`);

    // If a match is found, we've identified an overlap.
    if (suffixCandidate === prefixCandidate) {
      // The combined length is nominalLength + (nominalLength - currentOverlapLength),
      // which simplifies to nominalLength + suffixStartIndex based on the loop's definition.
      finalCombinedLength = nominalStringLength + suffixStartIndex;
      break; // Exit early as we've found the largest overlap (which results in the shortest combined string).
    }
  }

  // Output the computed minimal combined length.
  publishResult(finalCombinedLength);
}

// Invoke the main processing function with data retrieved from the system's input.
executeMainProcessing(retrieveSystemInput());