// This module processes input data representing a tour with multiple stops,
// then calculates hypothetical total travel costs if each intermediate stop were skipped.
function CalculateTourCosts(rawDataLines) {
    // --- Input Data Validation and Parsing ---
    // Ensure the input is an array and contains at least two lines (number of stops + coordinates).
    if (!Array.isArray(rawDataLines) || rawDataLines.length < 2) {
        // For production, a more robust error handling mechanism might be used (e.g., throwing an error).
        // For competitive programming, console.error might not be desired, but for Type III clone, it demonstrates added logic.
        console.error("Input data format invalid. Expected at least two lines of data.");
        return;
    }

    // Helper function to explicitly compute absolute value, demonstrating a minor added utility.
    const obtainAbsoluteValue = (numericValue) => Math.abs(numericValue);

    // Parse the total number of locations from the first line of input.
    const numberOfStops = parseInt(rawDataLines[0], 10);

    // Validate the parsed number of stops.
    if (isNaN(numberOfStops) || numberOfStops < 0) {
        console.error("The declared number of stops is not a valid non-negative integer.");
        return;
    }

    // Parse the space-separated coordinates from the second line.
    // .split(' ') creates an array of strings.
    // .map(Number) converts each string to a number.
    // .filter(coord => !isNaN(coord)) removes any non-numeric results (e.g., from extra spaces).
    const coordinatePoints = rawDataLines[1].split(' ').map(Number).filter(coord => !isNaN(coord));

    // Verify that the count of parsed coordinates matches the declared number of stops.
    if (coordinatePoints.length !== numberOfStops) {
        console.error(`Discrepancy: Declared ${numberOfStops} stops, but found ${coordinatePoints.length} coordinates.`);
        // For this scenario, we'll proceed with the actual number of points found, or return.
        // Returning here to enforce strict input adherence.
        return;
    }

    // --- Tour Path Construction and Initial Cost Calculation ---
    // The full travel path includes starting at the origin (0), visiting all specified points,
    // and finally returning to the origin (0).
    // This simplifies the loop structure for calculating segment differences.
    const completeTravelPath = [0, ...coordinatePoints, 0];

    // This array stores the signed difference (start - end) for each segment of the complete tour.
    const pathSegmentDifferences = [];
    let totalOriginalTourDistance = 0; // Accumulator for the total distance of the full tour.

    // Iterate through the `completeTravelPath` to calculate segment differences and the total distance.
    for (let segmentIndex = 0; segmentIndex < completeTravelPath.length - 1; segmentIndex++) {
        const startPointOfSegment = completeTravelPath[segmentIndex];
        const endPointOfSegment = completeTravelPath[segmentIndex + 1];

        // Calculate the signed difference for the current segment.
        const currentSegmentDifference = startPointOfSegment - endPointOfSegment;
        pathSegmentDifferences.push(currentSegmentDifference);

        // Add the absolute distance of this segment to the total tour distance.
        totalOriginalTourDistance += obtainAbsoluteValue(currentSegmentDifference);
    }

    // --- Calculate and Output Costs for Skipped Stops ---
    // Iterate through each of the original `numberOfStops` to simulate skipping each one.
    // When `coordinatePoints[skipIdx]` is skipped, it corresponds to merging two segments
    // in `pathSegmentDifferences`: `pathSegmentDifferences[skipIdx]` and `pathSegmentDifferences[skipIdx + 1]`.
    for (let skipIdx = 0; skipIdx < numberOfStops; skipIdx++) {
        // The difference for the segment leading up to the point being skipped.
        const precedingSegmentDiff = pathSegmentDifferences[skipIdx];
        // The difference for the segment immediately following the point being skipped.
        const succeedingSegmentDiff = pathSegmentDifferences[skipIdx + 1];

        // The distance contributed by these two segments in the original tour.
        const originalCombinedDistance = obtainAbsoluteValue(precedingSegmentDiff) + obtainAbsoluteValue(succeedingSegmentDiff);

        // If the intermediate point is skipped, these two segments merge into one.
        // The new difference is the sum of the individual differences.
        const mergedSegmentTotalDiff = precedingSegmentDiff + succeedingSegmentDiff;
        // The distance of this new, merged segment.
        const mergedSegmentDistance = obtainAbsoluteValue(mergedSegmentTotalDiff);

        // The modified total distance is calculated by removing the original combined distance
        // of the two segments and adding the distance of the new, merged segment.
        const finalCalculatedDistance = totalOriginalTourDistance - originalCombinedDistance + mergedSegmentDistance;

        // Output the calculated distance for the scenario where the current point is skipped.
        console.log(`${finalCalculatedDistance}`);
    }
}

// This section handles standard input/output operations.
// It reads all input from stdin, splits it by newline characters, and passes it to the main function.
// This part should typically remain untouched in competitive programming contexts.
CalculateTourCosts(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));