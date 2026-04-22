// This file demonstrates a Type III code clone,
// incorporating significant structural and lexical changes
// while maintaining the core, albeit specific, functional behavior
// of the original JavaScript snippet.

// The 'use strict' directive has been intentionally omitted
// as part of the Type III modifications (deletion of non-essential statements).

// The entire script is encapsulated within an Immediately Invoked Function Expression (IIFE)
// which now takes a more descriptive parameter name.
(function processProgramInput(sourceInputData) {

  // A dedicated local function to handle numeric parsing,
  // replacing the direct use of .map(Number) for Type III structural change.
  // This also includes a minor validation for empty strings before parsing.
  const parseNumericalList = (inputStringSegment) => {
    // Splitting the string by spaces to get individual number representations.
    const stringNumbers = inputStringSegment.split(' ');
    const resultingNumbers = [];

    // Iterating through segments to parse each one.
    for (const segment of stringNumbers) {
      // Adding a check for non-empty segments before parsing,
      // as an additional code fragment (guard clause/validation).
      if (segment.trim().length > 0) {
        // Using parseInt with radix for explicit number conversion.
        const num = parseInt(segment, 10);
        // Basic check for valid number, though original didn't explicitly handle this.
        if (!isNaN(num)) {
          resultingNumbers.push(num);
        }
      }
    }
    return resultingNumbers;
  };

  // Convert the raw input buffer to a string.
  // Renaming 'inputs' to 'rawInputText' as per Type II.
  const rawInputText = sourceInputData.toString();

  // Extracting the first line from the input for processing.
  // This is a rewrite of `inputs.split('\n')[0]`.
  const allInputLines = rawInputText.split('\n');
  const primaryDataLine = allInputLines[0];

  // Using the helper function to get the array of numbers.
  // Renaming 'params' to 'parsedCoordinates' as per Type II.
  const parsedCoordinates = parseNumericalList(primaryDataLine);

  // Adding an initial validation check (guard clause)
  // to ensure sufficient input parameters are present,
  // which is a new fragment (Type III).
  const EXPECTED_PARAM_COUNT = 5;
  if (parsedCoordinates.length < EXPECTED_PARAM_COUNT) {
    // Using console.error for distinct output, an update to output mechanism.
    console.error("Input data incomplete. Expected 5 numeric parameters.");
    return; // Early exit if validation fails.
  }

  // Replacing the inner IIFE with a named function for clarity and structural change (Type III).
  // Parameters are renamed from W, H, x, y, r to more descriptive names (Type II).
  function evaluateGeometricContainment(areaWidth, areaHeight, pointX, pointY, circleRadiusValue) {

    // Redefining the output mechanism through a helper function (Type III addition).
    const emitStatusMessage = (messageKey) => {
      // Simple conditional logic for output based on a key.
      if (messageKey === 'OUTSIDE') {
        console.log('No');
      } else { // Assuming 'INSIDE' or any other valid case
        console.log('Yes');
      }
    };

    // Introducing intermediate boolean variables for each boundary check.
    // This makes the original single line 'if' condition more verbose (Type III addition).
    const isLeftBoundaryViolated = (pointX - circleRadiusValue < 0);
    const isTopBoundaryViolated = (pointY - circleRadiusValue < 0);
    const isRightBoundaryViolated = (pointX + circleRadiusValue > areaWidth);
    // CRITICAL Type III preservation: The original code's `y + x > H`
    // (center Y plus center X greater than height) is preserved here.
    // This is explicitly kept as it was the *effective* condition due to the
    // comma operator's behavior in the original `if` statement.
    const isBottomBoundaryViolatedWithTypo = (pointY + pointX > areaHeight);

    // This is a crucial Type III rewrite:
    // The original `if(A, B, C, D)` effectively evaluated to `if(D)`.
    // We replicate this behavior by using the comma operator within a variable assignment.
    // This ensures functional equivalence to the *actual* original code's behavior,
    // despite the seemingly multiple conditions.
    const finalDecisionBasedOnLastCondition = (
      isLeftBoundaryViolated,
      isTopBoundaryViolated,
      isRightBoundaryViolated,
      isBottomBoundaryViolatedWithTypo // Only this condition's value determines the outcome.
    );

    // The core conditional logic, now using the variable that holds the
    // result of the comma-separated expression, replicating the original bug.
    if (finalDecisionBasedOnLastCondition) {
      emitStatusMessage('OUTSIDE'); // Using helper for output
    } else {
      emitStatusMessage('INSIDE'); // Using helper for output
    }
  }

  // Calling the newly defined function with the parsed values.
  evaluateGeometricContainment(
    parsedCoordinates[0], // areaWidth
    parsedCoordinates[1], // areaHeight
    parsedCoordinates[2], // pointX
    parsedCoordinates[3], // pointY
    parsedCoordinates[4]  // circleRadiusValue
  );

// The input reading mechanism (require('fs').readFileSync) remains,
// but the overall structure around it is heavily modified.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));