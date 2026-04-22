function ProcessPathData(rawData) {
    // This function processes path data to find a sequence of jumps.
    // rawData: The entire input string, typically from standard input.

    // Step 1: Parse the input data into individual lines.
    const parsedLines = rawData.split('\n');

    // Step 2: Extract and convert numerical parameters from the first line.
    // targetDistance (N): The total distance to cover.
    // maxJumpLen (M): The maximum length of a single jump.
    let [targetDistance, maxJumpLen] = parsedLines[0].split(' ').map(Number);

    // Step 3: Extract the terrain map from the second line.
    // terrainMap (S): A string where '0' indicates a valid landing spot, '1' indicates an obstacle.
    // Assuming terrainMap is 0-indexed, and terrainMap[k] describes position k.
    const terrainMap = parsedLines[1];

    // Initialize the variable to store the final computed path or error indicator.
    let finalOutcome = null;

    // Step 4: Implement robust input validation (Type III addition: guard clauses).
    // Check for negative distances, invalid jump lengths, or missing/insufficient map data.
    if (targetDistance < 0 || maxJumpLen <= 0 || !terrainMap || terrainMap.length < targetDistance) {
        console.warn("Path computation warning: Invalid or insufficient input parameters detected.");
        finalOutcome = -1; // Indicate an impossible path due to bad input
        console.log(finalOutcome); // Output the error and exit early
        return;
    }

    // Step 5: Handle the trivial case where the target is within a single jump from the start.
    if (targetDistance <= maxJumpLen) {
        finalOutcome = targetDistance;
    } else {
        // Step 6: Initialize structures for complex path finding.
        // jumpSequence: An array to store the lengths of the successful jumps.
        //              It's built in reverse order, then unshifted to maintain correct sequence.
        const jumpSequence = [];
        // coveredPathLength: Tracks the cumulative distance covered from the origin (position 0).
        let coveredPathLength = 0;

        // Step 7: Main path-finding loop (Type III structural change: while loop with inner for loop).
        // This loop continues until the target distance is fully covered or no valid path can be found.
        while (coveredPathLength < targetDistance) {
            let currentSegmentFound = false; // Flag to indicate if a valid jump was found in this iteration.

            // Inner loop: Searches for the largest possible valid jump from the current position.
            // Iterates backwards from maxJumpLen down to 1 (a jump of 0 length makes no progress).
            for (let candidateJumpSize = maxJumpLen; candidateJumpSize >= 1; candidateJumpSize--) {
                // Calculate the absolute position on the terrainMap if this jump is made.
                // The logic works backward from the target. `targetDistance - coveredPathLength` is the remaining distance.
                // `potentialLandingSpot` is the point on the map we would land at, assuming we made a jump of `candidateJumpSize`
                // to cover part of the `targetDistance - coveredPathLength` segment.
                const potentialLandingSpot = targetDistance - coveredPathLength - candidateJumpSize;

                // Condition A: Can we reach the origin (position 0 or less) with this jump?
                // This means the remaining distance `targetDistance - coveredPathLength` is less than or equal to `candidateJumpSize`.
                if (potentialLandingSpot <= 0) {
                    // Successfully reached the origin. The final jump length is the remaining distance.
                    jumpSequence.unshift(targetDistance - coveredPathLength);
                    coveredPathLength = targetDistance; // Mark as fully covered.
                    currentSegmentFound = true;
                    break; // Exit inner loop, as a path segment is found.
                }

                // Condition B: Is the potential landing spot a valid '0' on the terrainMap?
                // Ensure the `potentialLandingSpot` is within valid bounds of the `terrainMap` string.
                if (potentialLandingSpot >= 0 && potentialLandingSpot < terrainMap.length && terrainMap.charAt(potentialLandingSpot) === '0') {
                    // Valid landing spot found. Add this jump length to the sequence.
                    jumpSequence.unshift(candidateJumpSize);
                    // Update the total covered path length.
                    coveredPathLength += candidateJumpSize;
                    currentSegmentFound = true;
                    // Break from the inner loop to restart the search for the next segment from `maxJumpLen`.
                    break;
                }
            }

            // If no valid jump was found in the current iteration, the path is impossible.
            if (!currentSegmentFound) {
                finalOutcome = -1; // Indicate impossible path.
                break; // Exit outer while loop.
            }
        }

        // Step 8: Determine the final output based on whether the path was completed.
        if (coveredPathLength === targetDistance) {
            finalOutcome = jumpSequence.join(" "); // Format the sequence of jumps as a space-separated string.
        } else {
            // If the loop exited without covering the full distance, it means finalOutcome must be -1.
            // This is a fallback to ensure finalOutcome is -1 if it wasn't explicitly set.
            if (finalOutcome === null) {
                finalOutcome = -1;
            }
        }
    }

    // Step 9: Output the final result.
    console.log(`${finalOutcome}`);
}

// Do not modify the code below this line (standard input/output handling).
ProcessPathData(require("fs").readFileSync("/dev/stdin", "utf8"));