// This module handles robot path planning and reachability analysis for a 2D grid.
// It determines if a robotic entity can reach a specified target coordinate
// based on a sequence of movement commands and turning instructions.

// Main processing function for robot path evaluation.
const evaluateRobotPath = (fullInputString) => {

    // --- Input Validation and Parsing ---
    // Guard clause: Check for empty or invalid overall input.
    if (!fullInputString || fullInputString.trim().length === 0) {
        // If no input is provided, the target cannot be reached.
        console.log("No");
        return;
    }

    // Split the raw input string into individual lines.
    const inputLines = fullInputString.split("\n");

    // Ensure that both movement commands and target coordinates are provided.
    if (inputLines.length < 2) {
        // Insufficient data to determine path reachability.
        console.log("No");
        return;
    }

    // The first line contains the robot's movement command sequence.
    const commandSequence = inputLines[0];

    // The second line contains the target X and Y coordinates, separated by spaces.
    const targetCoordinateStrings = inputLines[1].split(" ");
    // Convert target coordinate strings to numerical values.
    const finalDestination = [
        Number(targetCoordinateStrings[0]),
        Number(targetCoordinateStrings[1])
    ];

    // --- Movement Segment Extraction ---
    // The 'T' character in the command sequence represents a 90-degree turn.
    // Splitting by 'T' yields segments of 'F' (forward) movements.
    const movementSegments = commandSequence.split("T");

    // Initialize arrays to store the magnitudes of movements along the X and Y axes.
    // The robot starts facing positive X.
    // Even-indexed segments (0, 2, 4...) correspond to X-axis movements.
    // Odd-indexed segments (1, 3, 5...) correspond to Y-axis movements.
    const xAxisDisplacements = [];
    const yAxisDisplacements = [];

    // Iterate through the movement segments to populate the displacement arrays.
    movementSegments.forEach((segment, segmentIndex) => {
        const segmentLength = segment.length; // Length of 'F's in the segment.
        if (segmentIndex % 2 === 0) { // If segment index is even, it's an X-axis movement.
            xAxisDisplacements.push(segmentLength);
        } else { // If segment index is odd, it's a Y-axis movement.
            yAxisDisplacements.push(segmentLength);
        }
    });

    // --- Dynamic Programming Helper Function ---
    // This utility function generates a new set of possible coordinates
    // by applying a given movement value (positive and negative) to an existing set of coordinates.
    const calculateNextPositions = (currentPositionsSet, moveValue) => {
        const nextPossiblePositions = new Set();
        // For each position reachable in the previous step...
        currentPositionsSet.forEach(previousCoordinate => {
            // Add the new position by moving forward.
            nextPossiblePositions.add(previousCoordinate + moveValue);
            // Add the new position by moving backward (due to turns).
            // A Set automatically handles duplicate values, making the `if (moveValue !== 0)` check unnecessary.
            nextPossiblePositions.add(previousCoordinate - moveValue);
        });
        return nextPossiblePositions;
    };

    // --- X-axis Reachability Analysis ---
    let possibleXCoordinates = new Set();
    let xTargetAchievable = false; // Flag to indicate if the target X-coordinate is reachable.

    // Proceed only if there are X-axis movements defined.
    if (xAxisDisplacements.length > 0) {
        // The first X-movement (xAxisDisplacements[0]) is always a fixed forward step
        // from the origin (0,0) in the positive X direction.
        // This behavior precisely replicates the original code's `x[0].push(dx[0])`.
        const initialXStepMagnitude = xAxisDisplacements[0];
        possibleXCoordinates.add(initialXStepMagnitude);

        // Iterate through the intermediate X-movement segments.
        // These segments (from index 1 up to the second-to-last) allow both positive and negative displacement.
        for (let stepIndex = 1; stepIndex < xAxisDisplacements.length - 1; stepIndex++) {
            possibleXCoordinates = calculateNextPositions(possibleXCoordinates, xAxisDisplacements[stepIndex]);
        }

        // Handle the final X-movement segment separately.
        // The original code only checks for target reachability at the very last step,
        // and only if there was more than one X-movement segment in total.
        if (xAxisDisplacements.length > 1) { // This condition mirrors `j === dx.length - 1` when `j > 0`.
            const finalXMoveMagnitude = xAxisDisplacements[xAxisDisplacements.length - 1];
            // Check if adding or subtracting the final movement magnitude from any
            // reachable intermediate X-coordinate hits the target X.
            possibleXCoordinates.forEach(previousXCoord => {
                if (previousXCoord + finalXMoveMagnitude === finalDestination[0] ||
                    previousXCoord - finalXMoveMagnitude === finalDestination[0]) {
                    xTargetAchievable = true; // Target X is found.
                }
            });
        }
        // If `xAxisDisplacements.length` is 1, `xTargetAchievable` remains `false`,
        // aligning with the original code's behavior for this edge case.
    }
    // If `xAxisDisplacements.length` is 0 (which is an impossible scenario given `s.split('T')` always produces at least one segment for `dx`),
    // `xTargetAchievable` would correctly remain `false`.

    // --- Y-axis Reachability Analysis ---
    let possibleYCoordinates = new Set();
    let yTargetAchievable = false; // Flag to indicate if the target Y-coordinate is reachable.

    // Proceed only if there are Y-axis movements defined.
    if (yAxisDisplacements.length > 0) {
        // Similar to the X-axis, the first Y-movement (yAxisDisplacements[0]) is treated
        // as a fixed forward step in the positive direction along the Y-axis.
        // This replicates the original code's `y[0].push(dy[0])` behavior.
        const initialYStepMagnitude = yAxisDisplacements[0];
        possibleYCoordinates.add(initialYStepMagnitude);

        // Iterate through the intermediate Y-movement segments.
        for (let stepIndex = 1; stepIndex < yAxisDisplacements.length - 1; stepIndex++) {
            possibleYCoordinates = calculateNextPositions(possibleYCoordinates, yAxisDisplacements[stepIndex]);
        }

        // Handle the final Y-movement segment for target reachability.
        // This mirrors the original code's `if (j === dy.length - 1)` block.
        if (yAxisDisplacements.length > 1) { // Only if there are subsequent moves after the initial one.
            const finalYMoveMagnitude = yAxisDisplacements[yAxisDisplacements.length - 1];
            possibleYCoordinates.forEach(previousYCoord => {
                // IMPORTANT: Corrected a potential bug from the original code.
                // The original had `dest[0]` here, which should logically be `dest[1]`
                // for checking the Y-coordinate target. This update maintains the intended functionality.
                if (previousYCoord + finalYMoveMagnitude === finalDestination[1] ||
                    previousYCoord - finalYMoveMagnitude === finalDestination[1]) {
                    yTargetAchievable = true; // Target Y is found.
                }
            });
        }
        // If `yAxisDisplacements.length` is 1, `yTargetAchievable` remains `false`,
        // matching the original code's behavior.
    }
    // If `yAxisDisplacements.length` is 0, `yTargetAchievable` remains `false`,
    // matching the original code's behavior (which implies a Y-target of 0 is not reachable if no Y-moves are made).

    // --- Final Result Output ---
    // The robot can reach the target if and only if both the X and Y target coordinates are achievable.
    if (xTargetAchievable && yTargetAchievable) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

// --- Standard Input/Output Boilerplate ---
// This section is typically used in competitive programming environments
// to read all input from standard input and pass it to the main processing function.
evaluateRobotPath(require("fs").readFileSync("/dev/stdin", "utf8"));