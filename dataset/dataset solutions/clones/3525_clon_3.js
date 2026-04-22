let collectedInputLines = [];

const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Listener for each incoming line of text from standard input.
inputProcessor.on('line', (currentLineText) => {
  // Store the raw line; parsing into components will occur later.
  collectedInputLines.push(currentLineText);
});

// Listener for the end of the input stream.
inputProcessor.on('close', () => {
  // If no data was collected, inform the user and exit.
  if (collectedInputLines.length === 0) {
    console.log("No input provided for territorial assessment.");
    return;
  }

  // Determine if a territorial dispute exists based on the gathered input.
  const conflictDetected = assessTerritorialDispute(collectedInputLines);

  // Announce the outcome of the assessment.
  if (conflictDetected) {
    console.log("War");
  } else {
    console.log("No War");
  }
});

/**
 * Parses an array of string numbers and returns either the highest or lowest value found.
 * Includes basic validation for numeric strings.
 * @param {string[]} stringNumberArray An array where each element is expected to be a string representation of a number.
 * @param {boolean} findMaximum If true, the function will find the maximum value; otherwise, it finds the minimum.
 * @returns {number} The extreme value (max or min) found, or a safe extreme if the array is empty or parsing fails.
 */
function parseAndFindExtremeValue(stringNumberArray, findMaximum) {
  let extremeResult = findMaximum ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;

  // Handle cases where the input array is invalid or empty.
  if (!stringNumberArray || stringNumberArray.length === 0) {
    return extremeResult;
  }

  for (const strVal of stringNumberArray) {
    const numericVal = parseInt(strVal, 10); // Parse string to integer with radix 10.

    // Skip values that cannot be parsed into a number.
    if (isNaN(numericVal)) {
      // In a real application, consider logging this error or throwing an exception.
      continue;
    }

    if (findMaximum) {
      // Update maximum if a larger value is found.
      if (numericVal > extremeResult) {
        extremeResult = numericVal;
      }
    } else {
      // Update minimum if a smaller value is found.
      if (numericVal < extremeResult) {
        extremeResult = numericVal;
      }
    }
  }
  return extremeResult;
}

/**
 * Evaluates the potential for a territorial conflict between two empires based on their current
 * positions and desired expansion territories.
 * @param {string[]} territorialInputRows An array of strings, where each string is a line of input data.
 *   - Expected format:
 *     - Row 0: "N M X Y" (N, M are context-specific, X is Empire A's current position, Y is Empire B's current position)
 *     - Row 1: "a1 a2 ... ak" (List of desired coordinates for Empire A)
 *     - Row 2: "b1 b2 ... bl" (List of desired coordinates for Empire B)
 * @returns {boolean} True if a conflict is predicted, false otherwise.
 */
function assessTerritorialDispute(territorialInputRows) {
  // A guard clause to ensure sufficient input data is available.
  if (!territorialInputRows || territorialInputRows.length < 3) {
    console.error("Input Error: Not enough data rows to assess conflict.");
    return false;
  }

  // Process the first line to extract initial empire positions.
  const initialParameters = territorialInputRows[0].split(" ");
  if (initialParameters.length < 4) {
    console.error("Input Error: First line (parameters) is malformed or incomplete.");
    return false;
  }

  const empireAXCoordinate = parseInt(initialParameters[2], 10); // Empire A's current position (X)
  const empireBYCoordinate = parseInt(initialParameters[3], 10); // Empire B's current position (Y)

  // Validate that the parsed initial positions are actual numbers.
  if (isNaN(empireAXCoordinate) || isNaN(empireBYCoordinate)) {
    console.error("Input Error: Empire initial positions (X or Y) are not valid numbers.");
    return false;
  }

  // Split and parse the desired territory coordinates for both empires.
  const empireADesiredTerritories = territorialInputRows[1].split(" ");
  const empireBDesiredTerritories = territorialInputRows[2].split(" ");

  // Calculate the maximum desired coordinate for Empire A.
  const empireAReachMaximum = parseAndFindExtremeValue(empireADesiredTerritories, true);

  // Calculate the minimum desired coordinate for Empire B.
  const empireBFrontierMinimum = parseAndFindExtremeValue(empireBDesiredTerritories, false);

  // Evaluate the conditions under which a conflict is deemed inevitable.
  // Condition 1: Empire A's desired maximum territory extends to or beyond Empire B's current position.
  const aThreatensBInitial = empireAReachMaximum >= empireBYCoordinate;

  // Condition 2: Empire B's desired minimum territory extends to or below Empire A's current position.
  const bThreatensAInitial = empireBFrontierMinimum <= empireAXCoordinate;

  // Condition 3: The desired territories of Empire A and Empire B overlap or touch.
  const desiredTerritoryOverlap = empireAReachMaximum >= empireBFrontierMinimum;

  // If any of these conditions are met, a conflict is determined.
  if (aThreatensBInitial || bThreatensAInitial || desiredTerritoryOverlap) {
    return true; // Conflict is imminent.
  }

  return false; // No immediate conflict detected.
}