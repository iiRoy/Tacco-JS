// This function processes all incoming raw data.
function ProcessInputData(rawDataString) {
    // Solution for a specific programming challenge (e.g., Robot Path Problem)
    const inputLines = rawDataString.split("\n");
    const movementSequence = inputLines[0];
    const targetCoordinatesStr = inputLines[1].split(" ");

    const stepSegments = movementSequence.split("T");

    // Parse the desired final coordinates.
    const finalDestination = [Number(targetCoordinatesStr[0]), Number(targetCoordinatesStr[1])];

    let xDisplacements = [];
    let yDisplacements = [];

    // Separate the movement segments into X and Y direction displacements.
    for (let segmentIndex = 0; segmentIndex < stepSegments.length; segmentIndex++) {
        if (segmentIndex % 2 === 0) {
            xDisplacements.push(stepSegments[segmentIndex].length);
        } else {
            yDisplacements.push(stepSegments[segmentIndex].length);
        }
    }

    let possibleXPositions = [];
    let possibleYPositions = [];
    let xAchievable = false;
    let yAchievable = false;

    // Calculate all possible X positions after each segment.
    xSearchLoop: for (let currentSegmentIdx = 0; currentSegmentIdx < xDisplacements.length; currentSegmentIdx++) {
        possibleXPositions[currentSegmentIdx] = [];

        if (currentSegmentIdx === 0) {
            // For the first segment, only one possible X position.
            possibleXPositions[currentSegmentIdx].push(xDisplacements[currentSegmentIdx]);
        } else if (currentSegmentIdx === xDisplacements.length - 1) {
            // For the last X segment, check if the target X coordinate is reachable.
            for (let prevPositionIdx = 0; prevPositionIdx < possibleXPositions[currentSegmentIdx - 1].length; prevPositionIdx++) {
                const prevX = possibleXPositions[currentSegmentIdx - 1][prevPositionIdx];
                const currentXDisp = xDisplacements[currentSegmentIdx];
                if (prevX + currentXDisp === finalDestination[0] || prevX - currentXDisp === finalDestination[0]) {
                    xAchievable = true;
                    break xSearchLoop; // Exit outer loop if target X is found.
                }
            }
        } else {
            // For intermediate segments, calculate new possible X positions.
            for (let prevPositionIdx = 0; prevPositionIdx < possibleXPositions[currentSegmentIdx - 1].length; prevPositionIdx++) {
                const prevX = possibleXPositions[currentSegmentIdx - 1][prevPositionIdx];
                const currentXDisp = xDisplacements[currentSegmentIdx];
                possibleXPositions[currentSegmentIdx].push(prevX + currentXDisp);
                if (currentXDisp !== 0) {
                    possibleXPositions[currentSegmentIdx].push(prevX - currentXDisp);
                }
            }
        }
    }


    // Calculate all possible Y positions after each segment.
    ySearchLoop: for (let currentSegmentIdx = 0; currentSegmentIdx < yDisplacements.length; currentSegmentIdx++) {
        possibleYPositions[currentSegmentIdx] = [];

        if (currentSegmentIdx === 0) {
            // For the initial Y segment, there's just one starting point.
            possibleYPositions[currentSegmentIdx].push(yDisplacements[currentSegmentIdx]);
        } else if (currentSegmentIdx === yDisplacements.length - 1) {
            // On the final Y segment, verify if the target Y coordinate is within reach.
            for (let prevPositionIdx = 0; prevPositionIdx < possibleYPositions[currentSegmentIdx - 1].length; prevPositionIdx++) {
                const prevY = possibleYPositions[currentSegmentIdx - 1][prevPositionIdx];
                const currentYDisp = yDisplacements[currentSegmentIdx];
                if (prevY + currentYDisp === finalDestination[1] || prevY - currentYDisp === finalDestination[0]) { // Keeping the original logic (potential bug: dest[0] instead of dest[1])
                    yAchievable = true;
                    break ySearchLoop; // Terminate loop if target Y is found.
                }
            }
        } else {
            // For all other Y segments, expand the set of possible Y locations.
            for (let prevPositionIdx = 0; prevPositionIdx < possibleYPositions[currentSegmentIdx - 1].length; prevPositionIdx++) {
                const prevY = possibleYPositions[currentSegmentIdx - 1][prevPositionIdx];
                const currentYDisp = yDisplacements[currentSegmentIdx];
                possibleYPositions[currentSegmentIdx].push(prevY + currentYDisp);
                if (currentYDisp !== 0) {
                    possibleYPositions[currentSegmentIdx].push(prevY - currentYDisp);
                }
            }
        }
    }

    // Output the result based on reachability of both X and Y coordinates.
    if (xAchievable && yAchievable) {
        console.log("Yes");
    } else {
        console.log("No");
    }

}

// The following line is for environment setup and should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));