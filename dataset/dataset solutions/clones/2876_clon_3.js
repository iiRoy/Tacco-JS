let rawInputLines = [];

const inputProcessor = require('readline');

const ioInterface = inputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout
});

ioInterface.on('line', (currentInputLine) => {
    rawInputLines.push(currentInputLine);
});

ioInterface.on('close', () => {
    let finalResult = "Yes"; // Default assumption is that a solution exists.

    // Defensive check: Ensure we have at least two lines of input for processing.
    if (rawInputLines.length < 2) {
        // In a real application, you might want to set finalResult to "Error" or exit.
        // For this clone, we'll let it proceed with default if possible or error out.
        finalResult = "Error: Insufficient input data provided. Expected at least 2 lines."; // A Type III addition for robustness
        console.log(finalResult);
        return;
    }

    // Parse the first line to extract track and player parameters.
    // Parameters are assumed to be space-separated integers.
    const firstLineParams = rawInputLines[0].split(" ").map(val => parseInt(val, 10));

    // Use object destructuring for clearer parameter access.
    // trackSize: total length of the track (often unused explicitly, trackSegmentData.length is used).
    // playerOneStartPos: 0-indexed start position for player one.
    // playerOneEndPos: 0-indexed end position for player one.
    // playerTwoStartPos: 0-indexed start position for player two.
    // playerTwoEndPos: 0-indexed end position for player two.
    const { 0: trackSize, 1: playerOneStartPos, 2: playerOneEndPos, 3: playerTwoStartPos, 4: playerTwoEndPos } = firstLineParams;

    // Parse the second line into an array of characters representing the track layout.
    // Each character is a segment of the track, e.g., '.' for empty, '#' for obstacle.
    const trackSegmentData = rawInputLines[1].split("");

    // A boolean flag to determine if player one can create a passage for player two.
    let isPassagePossible = false;

    // Determine the effective range for obstacle checks. This is the maximum position
    // player two might reach or player one's start, based on problem interpretation.
    const obstacleCheckUpperBoundary = Math.max(playerTwoStartPos, playerTwoEndPos);

    // Helper function to check if a specific position on the track is an obstacle.
    // Includes boundary checks for safety to prevent out-of-bounds access.
    const isObstacleAt = (position) => {
        return position >= 0 && position < trackSegmentData.length && trackSegmentData[position] === '#';
    };

    // Helper function to check if a specific position on the track is an empty spot.
    // Includes boundary checks for safety.
    const isEmptySpotAt = (position) => {
        return position >= 0 && position < trackSegmentData.length && trackSegmentData[position] === '.';
    };

    // Iterate through the track segments to identify critical conditions.
    // Loop condition ensures we can safely check `currentSegmentIndex + 1`.
    let currentSegmentIndex = 0;
    while (currentSegmentIndex < trackSegmentData.length - 1) {
        // Condition 1: Check for two consecutive obstacles ('##').
        const hasDoubleObstacle = isObstacleAt(currentSegmentIndex) && isObstacleAt(currentSegmentIndex + 1);

        // Define the critical range where double obstacles would immediately block a path.
        // This range covers from player one's start up to the furthest point of player two's path.
        const withinCriticalRange = playerOneStartPos <= currentSegmentIndex && (currentSegmentIndex + 1) <= obstacleCheckUpperBoundary;

        // If a double obstacle is found within this critical range, it's an immediate 'No' scenario.
        if (hasDoubleObstacle && withinCriticalRange) {
            finalResult = "No";
            console.log(finalResult); // Output and then exit the handler.
            return;
        }

        // Condition 2: Check for three consecutive empty spots ('...') to enable passage.
        // This requires at least two more characters to check `currentSegmentIndex + 1` and `currentSegmentIndex + 2`.
        if (currentSegmentIndex + 2 < trackSegmentData.length) {
            const hasTripleEmptySpot = isEmptySpotAt(currentSegmentIndex) && isEmptySpotAt(currentSegmentIndex + 1) && isEmptySpotAt(currentSegmentIndex + 2);

            // The 'middle' empty spot (`currentSegmentIndex + 1`) must be within a specific range
            // defined by player one's end and player two's end positions.
            const inPassageZone = playerOneEndPos <= (currentSegmentIndex + 1) && (currentSegmentIndex + 1) <= playerTwoEndPos;

            // If such a triple empty spot is found in the passage zone, it means a passage is possible.
            if (hasTripleEmptySpot && inPassageZone) {
                isPassagePossible = true;
            }
        }
        currentSegmentIndex++; // Move to the next segment.
    }

    // Final decision logic, particularly for scenarios where player two needs to "pass" player one.
    // This often happens if player two's destination is numerically before player two's start (moving backwards).
    const playerTwoNeedsToManeuver = playerTwoEndPos < playerTwoStartPos;

    // If player two needs to maneuver and no '...' passage was found,
    // we check for specific obstacles around player one's and player two's end points.
    if (playerTwoNeedsToManeuver && !isPassagePossible) {
        // Check for obstacles two positions before player one's end, or at player one's end itself.
        const p1ObstacleBlocking = isObstacleAt(playerOneEndPos - 2) || isObstacleAt(playerOneEndPos);
        // Check for obstacles two positions before player two's end, or at player two's end itself.
        const p2ObstacleBlocking = isObstacleAt(playerTwoEndPos - 2) || isObstacleAt(playerTwoEndPos);

        // If any of these specific critical points are blocked, and no general passage was possible,
        // then it's a "No" scenario.
        if (p1ObstacleBlocking || p2ObstacleBlocking) {
            finalResult = "No";
        }
    }

    // Output the final computed result.
    console.log(finalResult);
});