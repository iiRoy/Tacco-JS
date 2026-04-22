// This module handles input data processing.
function ProcessCoordinates(rawData) {
    // The raw input string is split into an array of individual lines.
    let lineData = rawData.split('\n');

    let dimensions = lineData[0].split(' ');
    let firstCount = parseInt(dimensions[0], 10);
    let secondCount = parseInt(dimensions[1], 10);
    // console.debug('Counts: %d %d', firstCount, secondCount); // Debugging output for counts.

    let coordSetOneX = [];
    let coordSetOneY = [];
    // Iterate through the first set of points.
    for (let idxA = 1; idxA <= firstCount; idxA++) {
        let pointAString = lineData[1 + idxA - 1].split(' ');
        coordSetOneX[idxA] = parseInt(pointAString[0], 10);
        coordSetOneY[idxA] = parseInt(pointAString[1], 10);
        // console.debug('Point A: %d %d', coordSetOneX[idxA], coordSetOneY[idxA]); // Displaying first set coordinates.
    }

    let coordSetTwoX = [];
    let coordSetTwoY = [];
    // Iterate through the second set of points.
    for (let idxB = 1; idxB <= secondCount; idxB++) {
        let pointBString = lineData[1 + firstCount + idxB - 1].split(' ');
        coordSetTwoX[idxB] = parseInt(pointBString[0], 10);
        coordSetTwoY[idxB] = parseInt(pointBString[1], 10);
        // console.debug('Point B: %d %d', coordSetTwoX[idxB], coordSetTwoY[idxB]); // Displaying second set coordinates.
    }
    // console.debug('--- Separator ---'); // Visual separator for debug logs.

    // Process each point from the first collection.
    for (let idxA = 1; idxA <= firstCount; idxA++) {
        let shortestDist = 0;
        let nearestIdx = 0;
        // Compare the current point from the first collection against all points in the second collection.
        for (let idxB = 1; idxB <= secondCount; idxB++) {
            // console.debug('== Current distance calculation: %d', Math.abs(coordSetOneX[idxA] - coordSetTwoX[idxB]) + Math.abs(coordSetOneY[idxA] - coordSetTwoY[idxB]));
            let currentDist = Math.abs(coordSetOneX[idxA] - coordSetTwoX[idxB]) + Math.abs(coordSetOneY[idxA] - coordSetTwoY[idxB]);
            if (idxB === 1) { // For the very first comparison, initialize minimums.
                shortestDist = currentDist;
                nearestIdx = idxB;
            } else { // For subsequent comparisons, check if a new minimum is found.
                if (currentDist < shortestDist) {
                    shortestDist = currentDist;
                    nearestIdx = idxB;
                }
            }
        }
        // console.debug('--- End of inner loop ---'); // Another debug separator.
        console.log(nearestIdx); // Output the index of the closest point from the second collection.
    }

    // Commented out section for reference, not part of active logic.
    // let valA = parseInt(lineData[0], 10);
    // let tmpArr = someArray[0].split(' ');
    // let valB = parseInt(tmpArr[0], 10);
    // let valC = parseInt(tmpArr[1], 10);
    // let textSegment = lineData[2];
    // Final output example:
    // console.log('%d %s', valA + valB + valC, textSegment);
}

// Do not modify the following line; it handles input/output redirection.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));