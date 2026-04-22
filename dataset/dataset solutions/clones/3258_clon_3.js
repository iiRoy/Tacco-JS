const DECIMAL_RADIX = 10;

/**
 * Analyzes a sequence of elevation points to compute the total cumulative ascent.
 * This function processes input that typically comes from a standard input stream,
 * where the first line specifies the number of points, and the second line lists
 * the actual elevation values separated by spaces.
 *
 * The calculation method includes the initial elevation of the first point,
 * and subsequently adds only positive changes (climbs) between consecutive points.
 * Descending or maintaining the same elevation does not add to the total ascent.
 *
 * @param {string} rawInputString - The full input content as a single string.
 */
function calculateCumulativeElevation(rawInputString) {
    // --- Input Validation and Pre-processing ---

    // Guard clause: Ensure the raw input string is not empty or just whitespace.
    if (!rawInputString || rawInputString.trim().length === 0) {
        console.error("Processing Error: Input string is empty or contains only whitespace.");
        return; // Terminate execution gracefully.
    }

    // Split the raw input into an array of individual lines.
    const inputLines = rawInputString.split("\n");

    // Guard clause: Verify that we have at least two lines (one for count, one for data).
    if (inputLines.length < 2) {
        console.error("Processing Error: Insufficient input lines provided. Expected at least two lines.");
        return;
    }

    // Attempt to parse the total expected number of elevation points from the first line.
    const declaredPointsCount = parseInt(inputLines[0], DECIMAL_RADIX);

    // Guard clause: Validate if the parsed count is a legitimate number.
    if (isNaN(declaredPointsCount)) {
        console.error("Processing Error: The first line does not contain a valid number for point count.");
        return;
    }

    // --- Data Extraction and Transformation ---

    // Extract the string containing the space-separated elevation values from the second line.
    const elevationValueStrings = inputLines[1].split(" ");

    // Convert the array of elevation value strings into an array of actual numbers (integers).
    // During this mapping, we also perform a validation check for each individual point.
    const elevationPoints = elevationValueStrings.map(singlePointStr => {
        const parsedPoint = parseInt(singlePointStr, DECIMAL_RADIX);
        if (isNaN(parsedPoint)) {
            // Log a warning for non-numeric entries and return null to filter them out later.
            console.warn(`Data Warning: Encountered non-numeric elevation value '${singlePointStr}'. This point will be ignored.`);
            return null;
        }
        return parsedPoint;
    }).filter(point => point !== null); // Filter out any `null` values that resulted from parsing errors.

    // Cross-check: Compare the declared count with the actual number of successfully parsed points.
    if (elevationPoints.length !== declaredPointsCount) {
        console.warn(`Data Warning: Declared point count (${declaredPointsCount}) differs from actual parsed points (${elevationPoints.length}). Proceeding with actual parsed count.`);
        // In a real-world scenario, one might choose to throw an error here or adjust `declaredPointsCount`.
    }

    // Guard clause: If, after parsing and filtering, there are no valid elevation points.
    if (elevationPoints.length === 0) {
        console.log(0); // No points means no cumulative ascent.
        return;
    }

    // --- Core Cumulative Ascent Calculation ---

    let totalClimbedDistance = 0; // Initialize the accumulator for our total ascent.

    // The first elevation point is always considered as an initial "climb" from a base of zero.
    // We add its value to the total and set it as our starting reference for subsequent comparisons.
    let previousElevation = elevationPoints[0];
    totalClimbedDistance += previousElevation;

    // Iterate through the elevation points starting from the second element.
    // For each point, we compare it against the *previous* point to determine any climb.
    for (let pointIndex = 1; pointIndex < elevationPoints.length; pointIndex++) {
        const currentElevation = elevationPoints[pointIndex]; // Get the current elevation value.

        // Calculate the difference between the current and the previous elevation.
        const elevationChange = currentElevation - previousElevation;

        // If the change is positive, it signifies an ascent. Add this gain to our total.
        // Negative changes (descents) or zero changes (level ground) do not contribute.
        if (elevationChange > 0) {
            totalClimbedDistance += elevationChange;
        }

        // Update the 'previousElevation' to the 'currentElevation' for the next iteration.
        previousElevation = currentElevation;
    }

    // --- Output Result ---

    // Display the final calculated total cumulative elevation distance.
    console.log(totalClimbedDistance);
}

// --- Standard I/O Integration (DO NOT EDIT BELOW THIS LINE) ---
// This block is responsible for reading input from stdin and invoking the main processing function.
// It is typically provided by the execution environment and should remain unchanged.
calculateCumulativeElevation(require("fs").readFileSync("/dev/stdin", "utf8"));