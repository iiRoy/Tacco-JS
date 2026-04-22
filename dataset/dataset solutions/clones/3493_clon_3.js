const MIN_COORD_VALUE = 0;
const MAX_COORD_VALUE = 100;

/**
 * Safely converts a string to a number. If the conversion results in NaN,
 * it returns 0. This is similar to the behavior of `*1` on non-numeric strings,
 * which results in NaN, but provides a default for robustness.
 * @param {string} inputStr - The string to be converted.
 * @returns {number} The numeric value, or 0 if conversion fails.
 */
function parseNumericValue(inputStr) {
    const numericVal = Number(inputStr);
    return isNaN(numericVal) ? 0 : numericVal;
}

/**
 * Evaluates a candidate beacon center (currentXPosition, currentYPosition)
 * against a set of observed data points to determine if it's consistent
 * and to deduce the beacon's central height.
 *
 * The relationship for a point (x, y) with observed height h and a central beacon
 * at (X, Y) with central height H is: h = H - |X - x| - |Y - y|.
 * Rearranging for H: H = h + |X - x| + |Y - y|.
 *
 * Points with h = 0 are considered outside the beacon's direct influence and are skipped.
 *
 * @param {string[]} observationDataLines - An array of strings representing observation data.
 *                                        The first line is the count of observations,
 *                                        subsequent lines are "x y h" strings.
 * @param {number} currentXPosition - The X coordinate of the beacon center candidate.
 * @param {number} currentYPosition - The Y coordinate of the beacon center candidate.
 * @returns {number | boolean} The calculated central beacon height if consistent, otherwise `false`.
 */
function validateBeaconCandidate(observationDataLines, currentXPosition, currentYPosition) {
    // Basic input validation: ensure the array is not empty.
    if (!Array.isArray(observationDataLines) || observationDataLines.length === 0) {
        return false;
    }

    // Parse the total number of observation points from the first line.
    const numberOfObservations = parseNumericValue(observationDataLines[0]);

    // If the stated number of observations doesn't match the actual data lines available,
    // or if there are no observations, this candidate is invalid.
    if (numberOfObservations === 0 || observationDataLines.length < numberOfObservations + 1) {
        return false;
    }

    // This variable will hold the central height (H) derived from the observations.
    // It's initialized to 0 and will be set by the first relevant observation.
    let derivedBeaconHeight = 0;
    // A flag to track if we've successfully established `derivedBeaconHeight` from at least one observation.
    let initialHeightEstablished = false;

    // Iterate through each observation point, starting from the second line (index 1).
    for (let obsLineIndex = 1; obsLineIndex <= numberOfObservations; obsLineIndex++) {
        const currentObservationLine = observationDataLines[obsLineIndex];
        // Split the line into its x, y, and observed height (h) components.
        const observationComponents = currentObservationLine.split(" ");

        // Guard against malformed observation lines.
        if (observationComponents.length < 3) {
            return false; // Invalid data format.
        }

        const observedPointX = parseNumericValue(observationComponents[0]);
        const observedPointY = parseNumericValue(observationComponents[1]);
        const observedHeightAtPoint = parseNumericValue(observationComponents[2]);

        // If the observed height is 0, this point is outside the beacon's influence.
        // It provides no information about the central height, so we skip it.
        if (observedHeightAtPoint === 0) {
            continue;
        }

        // Calculate the central beacon height based on the current observation:
        // H = h_observed + |X_center - x_observed| + |Y_center - y_observed|
        const calculatedHeightFromThisPoint = observedHeightAtPoint +
                                              Math.abs(currentXPosition - observedPointX) +
                                              Math.abs(currentYPosition - observedPointY);

        // For the very first non-zero observation, we establish the `derivedBeaconHeight`.
        if (!initialHeightEstablished) {
            derivedBeaconHeight = calculatedHeightFromThisPoint;
            initialHeightEstablished = true;
        } else {
            // For subsequent non-zero observations, we must ensure consistency.
            // If the calculated height from this point differs from the previously derived height,
            // then this (X, Y) candidate is not valid for all observations.
            if (derivedBeaconHeight !== calculatedHeightFromThisPoint) {
                return false; // Inconsistent heights, so this candidate is invalid.
            }
        }
    }

    // If the loop completes and `initialHeightEstablished` is true, it means all
    // non-zero observations were consistent, and we have a valid `derivedBeaconHeight`.
    // If no non-zero observations were found (`initialHeightEstablished` is false),
    // `derivedBeaconHeight` remains 0. The original problem implies H > 0 for a valid beacon
    // that produces h > 0 points. If all h are 0, original code returns 0, which is falsy.
    // So, if `derivedBeaconHeight` is 0 and `initialHeightEstablished` is false, it's effectively an invalid candidate.
    // If it's 0 but `initialHeightEstablished` is true, it means all points consistently led to H=0, which is also a valid return from original code.
    return derivedBeaconHeight;
}

/**
 * Searches for the central position (X, Y) and height (H) of a beacon
 * within a predefined coordinate range, using provided observation data.
 *
 * @param {string} rawInputData - The raw input string, expected to be newline-separated lines.
 * @returns {string | null} A formatted string "X Y H" if a beacon is found,
 *                          or `null` if no valid beacon is found within the search space.
 */
function findBeaconOrigin(rawInputData) {
    // Perform an initial check for empty or invalid input data.
    if (!rawInputData || rawInputData.trim().length === 0) {
        return null; // No data to process.
    }

    // Split the raw input string into an array of lines.
    // Filter out any empty lines that might occur from extra newlines.
    const processedInputLines = rawInputData.split("\n").filter(line => line.trim() !== "");

    // Iterate through all possible X coordinates within the defined search range.
    for (let candidateXCoord = MIN_COORD_VALUE; candidateXCoord <= MAX_COORD_VALUE; candidateXCoord++) {
        // For each X coordinate, iterate through all possible Y coordinates.
        for (let candidateYCoord = MIN_COORD_VALUE; candidateYCoord <= MAX_COORD_VALUE; candidateYCoord++) {
            // Call the validation function to check if the current (X, Y) pair
            // is a consistent beacon center for all observations.
            // It returns the deduced height (a positive number) if valid, or `false`.
            const deducedBeaconHeight = validateBeaconCandidate(processedInputLines, candidateXCoord, candidateYCoord);

            // If `deducedBeaconHeight` is a truthy value (i.e., a valid height > 0, or 0 if all h were 0),
            // we have successfully identified the beacon's properties.
            if (deducedBeaconHeight || deducedBeaconHeight === 0) { // Explicitly check for 0 as it's a valid return for original code
                // Return the found coordinates and height in the specified format using a template literal.
                return `${candidateXCoord} ${candidateYCoord} ${deducedBeaconHeight}`;
            }
        }
    }

    // If the nested loops complete without finding any valid beacon,
    // return null to indicate no solution was found within the search range.
    return null;
}

// The following line is part of the execution environment setup and is not part of the cloned code itself.
// console.log(findBeaconOrigin(require("fs").readFileSync("/dev/stdin", "utf8")));