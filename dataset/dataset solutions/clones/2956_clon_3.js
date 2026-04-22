// Function to process a four-digit date string and determine its format.
function analyzeDateSequence(dateInput) {
  // Validate input length and type early on for robustness.
  if (typeof dateInput !== 'string' || dateInput.length !== 4) {
    console.log("INVALID_INPUT_FORMAT"); // Output a specific error for invalid input structure.
    return; // Exit the function.
  }

  // Extract the two-character segments from the input string.
  // Using substring directly avoids intermediate array creation.
  const firstSegmentString = dateInput.substring(0, 2);
  const secondSegmentString = dateInput.substring(2, 4);

  // Convert the string segments into their numeric equivalents for analysis.
  // The radix (10) is explicitly provided for safe parsing.
  const firstSegmentValue = parseInt(firstSegmentString, 10);
  const secondSegmentValue = parseInt(secondSegmentString, 10);

  // Determine the validity classification for each numeric segment.
  // 'TYPE_ZERO' (00) indicates an invalid segment for month/year.
  // 'TYPE_MONTH_OR_YEAR' (01-12) indicates a segment that could be a month or a small year.
  // 'TYPE_YEAR_ONLY' (13-99) indicates a segment that can only be a year.
  const classificationFirst = classifyNumericSegment(firstSegmentValue);
  const classificationSecond = classifyNumericSegment(secondSegmentValue);

  let finalFormatDetermination = ""; // Variable to hold the determined date format.

  // Introduce boolean flags for clearer conditional logic.
  const isFirstSegmentZero = (classificationFirst === "TYPE_ZERO");
  const isSecondSegmentZero = (classificationSecond === "TYPE_ZERO");
  const bothSegmentsAreYearsBeyondMonthRange = (classificationFirst === "TYPE_YEAR_ONLY" && classificationSecond === "TYPE_YEAR_ONLY");

  const firstSegmentIsMonthCandidate = (classificationFirst === "TYPE_MONTH_OR_YEAR");
  const secondSegmentIsMonthCandidate = (classificationSecond === "TYPE_MONTH_OR_YEAR");

  const firstSegmentIsStrictlyYear = (classificationFirst === "TYPE_YEAR_ONLY");
  const secondSegmentIsStrictlyYear = (classificationSecond === "TYPE_YEAR_ONLY");


  // Main decision logic to identify the date format.
  if (isFirstSegmentZero || isSecondSegmentZero || bothSegmentsAreYearsBeyondMonthRange) {
    // If either segment is '00' or both are in the '13-99' range (e.g., "1313", "9999").
    finalFormatDetermination = "NOT_APPLICABLE";
  } else if (firstSegmentIsMonthCandidate) {
    // If the first segment (A) can be a month (01-12).
    if (secondSegmentIsStrictlyYear) {
      // If the second segment (B) can only be a year (13-99).
      // This implies A is MM, B is YY (e.g., "0113", "1299").
      finalFormatDetermination = "MONTH_THEN_YEAR";
    } else {
      // If the second segment (B) can also be a month (01-12).
      // This implies both A and B could be MM or YY (e.g., "0101", "1212").
      finalFormatDetermination = "FORMAT_AMBIGUOUS";
    }
  } else if (firstSegmentIsStrictlyYear) {
    // If the first segment (A) can only be a year (13-99).
    if (secondSegmentIsMonthCandidate) {
      // If the second segment (B) can be a month (01-12).
      // This implies A is YY, B is MM (e.g., "1301", "9912").
      finalFormatDetermination = "YEAR_THEN_MONTH";
    } else {
      // This 'else' branch implies the second segment is also 'TYPE_YEAR_ONLY'
      // or 'TYPE_ZERO'. The 'TYPE_ZERO' case is caught by the initial 'if'.
      // So, this effectively means both are 'TYPE_YEAR_ONLY', which is also
      // covered by 'bothSegmentsAreYearsBeyondMonthRange'. This serves as a
      // redundant path for 'NOT_APPLICABLE' if the logic flow reaches here.
      finalFormatDetermination = "NOT_APPLICABLE";
    }
  } else {
    // A catch-all for any unhandled or erroneous states.
    finalFormatDetermination = "UNKNOWN_ERROR";
  }

  // Display the determined format to the console.
  console.log(finalFormatDetermination);
}

/**
 * Classifies a two-digit numeric segment based on its value.
 * @param {number} numericSegment The numeric value of the two-digit segment (0-99).
 * @returns {string} One of:
 *   - "TYPE_ZERO": If the value is 0 (e.g., "00").
 *   - "TYPE_MONTH_OR_YEAR": If the value is between 1 and 12 (inclusive).
 *   - "TYPE_YEAR_ONLY": If the value is between 13 and 99 (inclusive).
 *   - "INVALID_NUMERIC_RANGE": If the value is outside the expected 0-99 range or not a number.
 */
function classifyNumericSegment(numericSegment) {
  // Defensive programming: check if the input is a valid number within expected range.
  if (isNaN(numericSegment) || numericSegment < 0 || numericSegment > 99) {
    return "INVALID_NUMERIC_RANGE";
  }

  if (numericSegment === 0) {
    return "TYPE_ZERO"; // '00' is a special case, typically invalid.
  } else if (numericSegment >= 1 && numericSegment <= 12) {
    return "TYPE_MONTH_OR_YEAR"; // Could be a month or a year (e.g., 01-12).
  } else { // Implies numericSegment is between 13 and 99.
    return "TYPE_YEAR_ONLY"; // Can only be a year (e.g., 13-99).
  }
}

// Entry point of the script: Reads input from standard input and processes it.
// This part mimics the original environment's input mechanism.
try {
  const stdInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  analyzeDateSequence(stdInputContent);
} catch (ioError) {
  // Log an error if input reading fails, and provide a default "NA" output
  // to ensure the program always produces an output string, similar to how
  // the original code might implicitly handle unparseable input (though not explicitly).
  console.error("Input processing error: " + ioError.message);
  console.log("NOT_APPLICABLE");
}