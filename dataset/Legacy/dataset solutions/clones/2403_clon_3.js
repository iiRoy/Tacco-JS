function solveProblem(problemData) {
    const dataLines = problemData.split("\n");
    const [totalDistanceStr, maxJumpStr] = dataLines[0].split(" ");
    const totalDistance = Number(totalDistanceStr);
    const maxJump = Number(maxJumpStr);
    const landingSpots = dataLines[1];

    let finalResult;
    const VALID_LANDING_CHAR = '0';

    if (totalDistance <= maxJump) {
        // If the total distance is less than or equal to the maximum jump,
        // we can reach 0 in one step of size 'totalDistance'.
        finalResult = totalDistance;
    } else {
        const jumpSequence = [];
        let currentPosition = totalDistance; // Start at the total distance, moving towards 0
        let isPathPossible = true;

        // Continue finding jumps until we reach or pass position 0
        while (currentPosition > 0) {
            let stepFoundInIteration = false;
            // Iterate from the largest possible jump down to 1
            // (A jump of 0 is not considered a valid move)
            for (let currentJumpSize = maxJump; currentJumpSize >= 1; currentJumpSize--) {
                const potentialTargetPosition = currentPosition - currentJumpSize;

                if (potentialTargetPosition < 0) {
                    // This jump would overshoot position 0, so try a smaller jump
                    continue;
                }

                if (potentialTargetPosition === 0) {
                    // We can land exactly on position 0 with this jump
                    jumpSequence.push(currentJumpSize);
                    currentPosition = 0; // Destination reached
                    stepFoundInIteration = true;
                    break; // Found a step, move to the next segment or finish
                }

                // Check if the potential target position is a valid landing spot
                if (landingSpots[potentialTargetPosition] === VALID_LANDING_CHAR) {
                    jumpSequence.push(currentJumpSize);
                    currentPosition = potentialTargetPosition; // Move to the new position
                    stepFoundInIteration = true;
                    break; // Found a step, restart search for the next jump from the new position
                }
            }

            if (!stepFoundInIteration && currentPosition > 0) {
                // If no valid jump was found from the current position to move closer to 0,
                // then it's impossible to reach 0.
                isPathPossible = false;
                break; // Exit the main loop
            }
        }

        if (!isPathPossible) {
            finalResult = -1;
        } else {
            // The jumps were collected in reverse order (from totalDistance down to 0),
            // so reverse the array to get the correct sequence from start to end.
            finalResult = jumpSequence.reverse().join(" ");
        }
    }

    // Output the result
    console.log('%s', finalResult);
}

// Standard input/output handling
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
