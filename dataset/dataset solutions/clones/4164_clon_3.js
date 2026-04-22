// This module is designed to simulate a robot's movement based on a sequence of commands
// and determine if a specific target coordinate pair is reachable.
// The robot starts at (0,0) facing the positive X-axis. 'F' moves forward, 'T' turns 90 degrees.

function ProcessRobotPath(rawData) {
    // Input validation: Ensure rawData is a non-empty string.
    if (typeof rawData !== 'string' || rawData.length === 0) {
        console.log("No"); // Output "No" for invalid or empty input, consistent with problem type.
        return;
    }

    // Split the entire input string into individual lines.
    const inputLines = rawData.split("\n");

    // Validate that we received at least two lines: one for commands, one for target coordinates.
    if (inputLines.length < 2) {
        console.log("No");
        return;
    }

    // Extract and trim the command sequence from the first line.
    const commandSequence = inputLines[0].trim();
    // Extract and trim the target coordinates string from the second line.
    const targetCoordinatesInput = inputLines[1].trim();

    // Handle the edge case where no movement commands are provided.
    // If commandSequence is empty, the robot never moves from (0,0).
    if (commandSequence.length === 0) {
        const targetParts = targetCoordinatesInput.split(" ");
        const targetX = Number(targetParts[0]);
        const targetY = Number(targetParts[1]);
        if (targetX === 0 && targetY === 0) {
            console.log("Yes"); // Only (0,0) is reachable with no commands.
        } else {
            console.log("No");
        }
        return;
    }

    // Parse the target X and Y coordinates.
    const targetParts = targetCoordinatesInput.split(" ");
    // Basic validation for target coordinate format.
    if (targetParts.length < 2) {
        console.log("No"); // Invalid target format (e.g., missing a coordinate).
        return;
    }
    const desiredXCoordinate = Number(targetParts[0]);
    const desiredYCoordinate = Number(targetParts[1]);

    // The 'T' command effectively separates movement segments.
    // Splitting by 'T' yields segments of 'F's. An empty string segment indicates an immediate turn.
    // Example: "FFTFFT" -> ["FF", "FF", ""]
    // Example: "TFFTFF" -> ["", "FF", "FF"]
    const movementSegments = commandSequence.split("T");

    // Arrays to store the lengths of forward movements for X and Y axes.
    // Movements along X-axis correspond to segments at even indices (0, 2, 4...).
    // Movements along Y-axis correspond to segments at odd indices (1, 3, 5...).
    const xAxisDistances = [];
    const yAxisDistances = [];

    // Iterate through the segments to populate the distance arrays.
    for (let segmentIndex = 0; segmentIndex < movementSegments.length; segmentIndex++) {
        const segmentLength = movementSegments[segmentIndex].length;
        if (segmentIndex % 2 === 0) {
            xAxisDistances.push(segmentLength);
        } else {
            yAxisDistances.push(segmentLength);
        }
    }

    /**
     * Calculates all possible reachable coordinates along a single axis given a sequence of movement lengths.
     * The first movement in the sequence is always considered a fixed positive displacement from the origin (0).
     * Subsequent movements can be either positive or negative relative to the current position on that axis.
     *
     * @param {number[]} distances - An array of movement lengths for a specific axis.
     * @returns {Set<number>} A Set containing all unique possible coordinate values reachable on this axis.
     */
    function calculatePossibleAxisPositions(distances) {
        let currentReachablePositions = new Set();

        // If there are no movement segments for this axis, the only reachable position is 0.
        if (distances.length === 0) {
            currentReachablePositions.add(0);
            return currentReachablePositions;
        }

        // The initial movement for an axis (distances[0]) is always in the positive direction
        // from the starting point of that axis's influence (which is 0 for the first segment).
        currentReachablePositions.add(distances[0]);

        // For all subsequent movement segments (from the second one onwards),
        // the robot has turned and can now move in either the positive or negative direction
        // along the current axis relative to its last position on that axis.
        for (let i = 1; i < distances.length; i++) {
            const nextPossiblePositions = new Set();
            const stepLength = distances[i];

            // For each position reachable in the previous step, calculate the new positions
            // by adding or subtracting the current step length.
            for (const previousPosition of currentReachablePositions) {
                nextPossiblePositions.add(previousPosition + stepLength);
                nextPossiblePositions.add(previousPosition - stepLength);
            }
            // Update the set of reachable positions for the current step.
            currentReachablePositions = nextPossiblePositions;
        }
        return currentReachablePositions;
    }

    // Determine all possible X-coordinates the robot can end up at.
    const finalReachableXCoordinates = calculatePossibleAxisPositions(xAxisDistances);

    // Determine all possible Y-coordinates the robot can end up at.
    const finalReachableYCoordinates = calculatePossibleAxisPositions(yAxisDistances);

    // Check if the target X coordinate is found within the set of reachable X coordinates.
    const isTargetXAchieved = finalReachableXCoordinates.has(desiredXCoordinate);
    // Check if the target Y coordinate is found within the set of reachable Y coordinates.
    const isTargetYAchieved = finalReachableYCoordinates.has(desiredYCoordinate);

    // If both target X and Y coordinates are reachable independently, then the combined target is reachable.
    if (isTargetXAchieved && isTargetYAchieved) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// This line handles standard input/output and should not be modified.
ProcessRobotPath(require("fs").readFileSync("/dev/stdin", "utf8"));