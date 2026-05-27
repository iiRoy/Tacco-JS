function processMovementRecursive(inputDataPayload) {
    // The original code parses inputDataPayload but immediately overwrites the result.
    // To maintain strict behavioral equivalence, even if the parsing result is discarded,
    // we could simulate the parsing. However, since the parsed value is not used
    // before being overwritten, and no errors from parsing would propagate
    // (e.g., parseInt("abc") results in NaN, which is then overwritten by 90),
    // we can safely omit the parsing of inputDataPayload.

    const xDisplacementMap = [0, 1, 0, -1]; // Corresponds to 90, 180, 270, 360 degrees
    const yDisplacementMap = [1, 0, -1, 0]; // Corresponds to 90, 180, 270, 360 degrees

    // Recursive helper function to simulate the path
    function navigatePath(currentXCoord, currentYCoord, currentBearingIndex, totalSteps) {
        // Base case: If the robot has returned to the origin (0,0) after taking at least one step.
        if (currentXCoord === 0 && currentYCoord === 0 && totalSteps > 0) {
            return totalSteps;
        }

        // Increment the step counter for the current move
        const nextTotalSteps = totalSteps + 1;

        // Calculate the next coordinates based on the current bearing
        const nextXCoord = currentXCoord + xDisplacementMap[currentBearingIndex];
        const nextYCoord = currentYCoord + yDisplacementMap[currentBearingIndex];

        // Update the bearing index for the next turn (90 degrees clockwise)
        // The modulo 4 ensures the index cycles through 0, 1, 2, 3
        const nextBearingIndex = (currentBearingIndex + 1) % 4;

        // Recursively call the function with the new state
        return navigatePath(nextXCoord, nextYCoord, nextBearingIndex, nextTotalSteps);
    }

    // Initiate the simulation from the starting point (0,0), initial bearing (90 degrees, index 0), and 0 steps.
    const finalStepCount = navigatePath(0, 0, 0, 0);

    // Output the final step count, matching the original's observable behavior.
    console.log(finalStepCount);
}

// The external contract for reading input from stdin must be preserved.
// The function name is changed from 'Main' to 'processMovementRecursive'.
processMovementRecursive(require("fs").readFileSync("/dev/stdin", "utf8"));
