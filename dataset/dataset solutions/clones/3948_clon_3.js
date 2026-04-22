const capturedInputLines = []; // Stores all lines read from standard input
const inputHandlerModule = require('readline'); // Module for reading input line by line

/**
 * Calculates the absolute difference between two numerical values.
 * This helper function abstracts the Math.abs call.
 * @param {number} valueA - The first number.
 * @param {number} valueB - The second number.
 * @returns {number} The absolute difference between valueA and valueB.
 */
const calculateAbsoluteDifference = (valueA, valueB) => {
    return Math.abs(valueA - valueB);
};

// Set up the interface for reading data from the console
const consoleInputInterface = inputHandlerModule.createInterface({
    input: process.stdin,  // Standard input stream
    output: process.stdout, // Standard output stream (not used for writing back, but required by createInterface)
});

// Event listener: triggered for each new line of input received
consoleInputInterface.on('line', (currentLineData) => {
    capturedInputLines.push(currentLineData); // Add the line to our buffer
});

// Event listener: triggered when the input stream ends (e.g., Ctrl+D on Unix, Ctrl+Z then Enter on Windows)
consoleInputInterface.on('close', () => {
    // --- Input Validation and Parsing ---
    // Ensure that at least two lines of input are available as expected
    if (capturedInputLines.length < 2) {
        console.error("Error: Not enough input lines provided. Expected at least two lines.");
        return; // Terminate execution if input is insufficient
    }

    // Parse the total count of points from the very first line of input
    const totalPointsCount = parseInt(capturedInputLines[0], 10); // Use parseInt with radix for robustness

    // Validate the parsed number of points
    if (isNaN(totalPointsCount) || totalPointsCount < 0) {
        console.error("Error: The first line must contain a non-negative integer representing the number of points.");
        return; // Terminate if the point count is invalid
    }

    // Process the second line to extract the individual point coordinates
    // Split by space, filter out any empty strings that might result from multiple spaces,
    // then convert each coordinate string to an integer.
    const rawCoordinateStrings = capturedInputLines[1].split(" ").filter(s => s.trim() !== '');
    const pointCoordinates = rawCoordinateStrings.map(coordStr => parseInt(coordStr, 10)); // Renamed 'A'

    // --- Array Padding / Sentinel Values ---
    // Define a constant for the sentinel value used for padding
    const pathPaddingValue = 0;

    // Add sentinel values (0) to both the beginning and end of the coordinate array.
    // This simplifies the distance calculations at the actual start and end points
    // by treating them as intermediate segments between two zeros.
    pointCoordinates.unshift(pathPaddingValue); // Add to the front
    pointCoordinates.push(pathPaddingValue);   // Add to the end

    // --- Initial Total Path Cost Calculation ---
    // Calculate the cumulative absolute difference (total cost) for traversing
    // all points in their original sequence, including the newly added sentinel values.
    let initialTraversalCost = 0; // Renamed 'Sum'
    for (let pointIndex = 1; pointIndex < totalPointsCount + 2; pointIndex++) {
        const currentPosition = pointCoordinates[pointIndex];
        const previousPosition = pointCoordinates[pointIndex - 1];
        initialTraversalCost += calculateAbsoluteDifference(currentPosition, previousPosition);
    }

    // --- Iterative Cost Calculation for Skipping Each Point ---
    // Loop through each *original* point in the sequence (excluding the sentinels).
    // For each point, calculate the total path cost if that specific point were to be skipped.
    for (let currentOriginalPointIdx = 1; currentOriginalPointIdx <= totalPointsCount; currentOriginalPointIdx++) {
        // Retrieve the coordinates of the three relevant points:
        // the point before the target, the target point itself, and the point after the target.
        const priorPointCoordinate = pointCoordinates[currentOriginalPointIdx - 1]; // Corresponds to A[i-1] in original
        const targetPointCoordinate = pointCoordinates[currentOriginalPointIdx];     // Corresponds to A[i] in original
        const nextPointCoordinate = pointCoordinates[currentOriginalPointIdx + 1];   // Corresponds to A[i+1] in original

        // Calculate the cost of the two segments that involve the 'targetPointCoordinate'.
        // These are the segments that would be removed if the target point is skipped.
        const costOfSegmentToTarget = calculateAbsoluteDifference(targetPointCoordinate, priorPointCoordinate);
        const costOfSegmentFromTarget = calculateAbsoluteDifference(nextPointCoordinate, targetPointCoordinate);
        const totalCostOfSkippedSegments = costOfSegmentToTarget + costOfSegmentFromTarget; // Intermediate sum

        // Calculate the cost of the new direct segment that bypasses the 'targetPointCoordinate'.
        const costOfNewDirectSegment = calculateAbsoluteDifference(nextPointCoordinate, priorPointCoordinate);

        // Determine the modified total path cost:
        // Start with the initial total cost, subtract the cost of the two segments
        // that are being removed, and then add the cost of the new direct segment.
        const modifiedPathCost = initialTraversalCost - totalCostOfSkippedSegments + costOfNewDirectSegment;

        // Output the calculated modified cost for the current scenario
        console.log(modifiedPathCost);
    }
});