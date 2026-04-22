const fileSystemModule = require('fs');

// Obtain all raw input data from the standard input stream.
// The data is then cleaned by removing leading/trailing whitespace
// and split into an array of individual text lines based on newline characters.
let rawInputDataBlock = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();
let sequenceOfLines = rawInputDataBlock.split("\n");

// Begin the primary processing cycle, handling multiple simulation scenarios.
while (true) {
    // Retrieve the initial line for the current scenario, which specifies grid dimensions or signals termination.
    let currentScenarioDimensions = sequenceOfLines.shift();

    // Check if the current line matches the specific termination sequence "0 0".
    if (currentScenarioDimensions === "0 0") {
        // If the termination signal is detected, exit the main scenario processing loop.
        break;
    }

    // Deconstruct the dimensions string into numerical values for width and height.
    // Each string segment is explicitly converted to an integer with base 10.
    let parsedSpatialBounds = currentScenarioDimensions.split(" ").map(dimensionString => parseInt(dimensionString, 10));
    let gridHorizontalExtent = parsedSpatialBounds[0]; // Assign the parsed width to a variable.
    let gridVerticalExtent = parsedSpatialBounds[1];   // Assign the parsed height to a variable.

    // Initialize the autonomous unit's state vector.
    // [0] represents current orientation (0=North, 1=East, 2=South, 3=West).
    // [1] represents the X-coordinate.
    // [2] represents the Y-coordinate.
    // The unit starts facing North at position (1,1).
    let autonomousUnitPose = [0, 1, 1];

    // Commence the command execution loop for the current simulation scenario.
    while (true) {
        // Extract and parse the next operational command from the sequence.
        let currentCommandTokens = sequenceOfLines.shift().split(" ");

        // If the command consists of two parts, ensure the second part (e.g., step count) is treated as a number.
        if (currentCommandTokens.length === 2) {
            currentCommandTokens[1] = parseInt(currentCommandTokens[1], 10);
        }

        // Evaluate if the current command is the "STOP" instruction.
        if (currentCommandTokens[0] === "STOP") {
            // Upon receiving the "STOP" command, terminate the inner command execution loop.
            break;
        }

        // Process the "RIGHT" rotation command.
        if (currentCommandTokens[0] === "RIGHT") {
            autonomousUnitPose[0]++; // Advance the orientation clockwise.
            if (autonomousUnitPose[0] === 4) {
                autonomousUnitPose[0] = 0; // Wrap around from West (3) back to North (0).
            }
        }
        // Process the "LEFT" rotation command.
        else if (currentCommandTokens[0] === "LEFT") {
            autonomousUnitPose[0]--; // Retract the orientation counter-clockwise.
            if (autonomousUnitPose[0] === -1) {
                autonomousUnitPose[0] = 3; // Wrap around from North (0) back to West (3).
            }
        }
        // Process the "FORWARD" movement command.
        else if (currentCommandTokens[0] === "FORWARD") {
            // Iterate for the number of steps specified in the command.
            let numberOfSteps = currentCommandTokens[1];
            while (numberOfSteps--) {
                // Adjust coordinates based on the autonomous unit's current orientation.
                if (autonomousUnitPose[0] === 0) autonomousUnitPose[2]++; // North: increment Y.
                else if (autonomousUnitPose[0] === 1) autonomousUnitPose[1]++; // East: increment X.
                else if (autonomousUnitPose[0] === 2) autonomousUnitPose[2]--; // South: decrement Y.
                else if (autonomousUnitPose[0] === 3) autonomousUnitPose[1]--; // West: decrement X.
            }
        }
        // Process the "BACKWARD" movement command.
        else if (currentCommandTokens[0] === "BACKWARD") {
            // Iterate for the number of steps specified in the command.
            let numberOfSteps = currentCommandTokens[1];
            while (numberOfSteps--) {
                // Adjust coordinates in the opposite direction of the current orientation.
                if (autonomousUnitPose[0] === 0) autonomousUnitPose[2]--; // North: decrement Y.
                else if (autonomousUnitPose[0] === 1) autonomousUnitPose[1]--; // East: decrement X.
                else if (autonomousUnitPose[0] === 2) autonomousUnitPose[2]++; // South: increment Y.
                else if (autonomousUnitPose[0] === 3) autonomousUnitPose[1]++; // West: increment X.
            }
        }

        // Apply boundary constraints for the X-coordinate, ensuring the unit remains within the grid.
        if (autonomousUnitPose[1] < 1) autonomousUnitPose[1] = 1;              // If X is below minimum, set to 1.
        if (autonomousUnitPose[1] > gridHorizontalExtent) autonomousUnitPose[1] = gridHorizontalExtent; // If X exceeds maximum, set to max width.

        // Apply boundary constraints for the Y-coordinate, ensuring the unit remains within the grid.
        if (autonomousUnitPose[2] < 1) autonomousUnitPose[2] = 1;              // If Y is below minimum, set to 1.
        if (autonomousUnitPose[2] > gridVerticalExtent) autonomousUnitPose[2] = gridVerticalExtent;     // If Y exceeds maximum, set to max height.
    }

    // Once all commands for the current scenario are processed, discard the orientation component.
    autonomousUnitPose.shift();

    // Output the final X and Y coordinates of the autonomous unit, separated by a single space.
    console.log(autonomousUnitPose.join(" "));
}