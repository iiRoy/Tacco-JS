const parseValidatedInteger = (valueString, contextName) => {
    const parsedValue = parseInt(valueString, 10);
    // Validate if the parsing was successful and the number is non-negative
    if (isNaN(parsedValue) || parsedValue < 0) {
        console.error(`Error: Encountered an invalid or negative numeric value for '${contextName}': '${valueString}'. Defaulting to 0.`);
        // In a real-world application, a more robust error handling mechanism (e.g., throwing an exception)
        // would be preferable to simply defaulting to 0.
        return 0; 
    }
    return parsedValue;
};

/**
 * Calculates the total accumulated cost for traversing a series of points,
 * applying a unit cost factor and a maximum charge per segment.
 * This function processes raw input text typically read from a file or standard input.
 *
 * @param {string} rawInputText - The entire input content as a single string.
 */
function calculateOptimalPathCost(rawInputText) {
    // Defensive check: ensure the input string is valid and not empty
    if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
        console.error("Input data is either missing or not a valid string. Aborting calculation.");
        return; // Terminate execution if input is unusable
    }

    // Divide the raw input into individual lines for structured processing
    const inputRows = rawInputText.split('\n');

    // Verify that we have at least two lines: one for configuration, one for data points
    if (inputRows.length < 2) {
        console.error("Insufficient number of input lines. Expected at least two lines for configuration and coordinates.");
        return;
    }

    // Extract and parse the first line which contains global configuration parameters (N, A, B)
    const configLineTokens = inputRows[0].split(' ');

    // Validate the number of configuration tokens
    if (configLineTokens.length < 3) {
        console.error("Missing expected configuration parameters (N, A, B) in the first line of input.");
        return;
    }

    // Parse the N, A, B values using the helper function for validation
    const expectedPointCount = parseValidatedInteger(configLineTokens[0], 'Expected Number of Points (N)');
    const costPerUnitDistance = parseValidatedInteger(configLineTokens[1], 'Cost Factor per Unit (A)');
    const maxChargePerSegment = parseValidatedInteger(configLineTokens[2], 'Maximum Charge per Segment (B)');

    // Additional sanity checks for core parameters
    if (expectedPointCount <= 0) {
        // If N is 0 or negative, there are no points or segments to process
        console.log(0); // Output 0 cost as no path exists
        return;
    }

    // Process the second line to obtain the sequence of position coordinates
    const rawCoordinateValues = inputRows[1].split(' ');
    const positionCoordinates = rawCoordinateValues.map(valStr => {
        const parsedCoord = parseInt(valStr, 10);
        if (isNaN(parsedCoord)) {
            // Log a warning for non-numeric coordinates and treat them as 0, or handle as error
            console.warn(`Warning: Non-numeric coordinate string encountered: '${valStr}'. Treating as 0.`);
            return 0;
        }
        return parsedCoord;
    });

    // Validate if the actual number of parsed coordinates matches the expected count (N)
    if (positionCoordinates.length !== expectedPointCount) {
        console.warn(`Mismatch: The input specified ${expectedPointCount} points, but ${positionCoordinates.length} coordinates were actually found.`);
        // For robustness, we'll proceed using the actual number of points available.
    }

    // Initialize the running total for all segment costs
    let totalAccumulatedCost = 0;

    // Determine the effective number of segments that can be formed
    // A path with 'P' points has 'P-1' segments.
    const actualSegmentCount = positionCoordinates.length - 1;

    // If there are fewer than two points, no segments can be formed, thus no cost.
    if (actualSegmentCount < 1) {
        console.log(0); // Output 0 if no segments are possible
        return;
    }

    // Iterate through the available segments to calculate and accumulate costs
    // The loop runs from the first segment (index 0) up to the second-to-last point.
    for (let segmentIdx = 0; segmentIdx < actualSegmentCount; ++segmentIdx) {
        // Extract the coordinates for the current segment's start and end points
        const startPointCoord = positionCoordinates[segmentIdx];
        const endPointCoord = positionCoordinates[segmentIdx + 1];

        // Calculate the length of the current segment.
        // Using Math.max(0, ...) ensures that distance is always non-negative,
        // even if points are not strictly increasing (prevents negative cost).
        const segmentLength = Math.max(0, endPointCoord - startPointCoord);

        // If a segment has zero length, it incurs no cost, so skip to the next iteration.
        if (segmentLength === 0) {
            continue;
        }

        // Calculate the base cost for this segment using the unit cost factor (A)
        const calculatedSegmentBaseCost = costPerUnitDistance * segmentLength;

        // Apply the maximum charge constraint (B) to determine the final cost for this segment
        const finalSegmentCharge = Math.min(calculatedSegmentBaseCost, maxChargePerSegment);

        // Add the determined segment charge to the overall total cost
        totalAccumulatedCost += finalSegmentCharge;
    }

    // Print the final computed total cost to the console
    console.log(totalAccumulatedCost);
}

// Standard entry point for competitive programming environments:
// Reads the entire content of /dev/stdin as a UTF-8 string and passes it to the main processing function.
calculateOptimalPathCost(require("fs").readFileSync("/dev/stdin", "utf8"));