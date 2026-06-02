"use strict";

function findInsertionPoint(sortedArr, targetVal) {
    let lowIdx = 0;
    let highIdx = sortedArr.length - 1;
    let midIdx = Math.floor((lowIdx + highIdx) / 2);

    // The loop continues as long as the target value is not found
    // and there is still a valid range to search within.
    while (sortedArr[midIdx] !== targetVal && lowIdx < highIdx) {
        if (targetVal < sortedArr[midIdx]) {
            highIdx = midIdx - 1;
        } else { // targetVal > sortedArr[midIdx]
            lowIdx = midIdx + 1;
        }
        midIdx = Math.floor((lowIdx + highIdx) / 2);
    }

    // After the loop, midIdx holds the index of targetVal if found,
    // or the appropriate insertion point if not found.
    // Refactored return logic for clarity while preserving exact behavior.
    if (sortedArr[midIdx] === targetVal) {
        return midIdx;
    } else if (sortedArr[midIdx] < targetVal) {
        return midIdx + 1;
    } else { // sortedArr[midIdx] > targetVal
        return midIdx;
    }
}

// Helper function to calculate the minimum travel distance between a query point, a shrine, and a temple.
function calculateMinTravelDistance(currentX, shrineLocation, templeLocation) {
    const distanceXToShrine = Math.abs(shrineLocation - currentX);
    const distanceShrineToTemple = Math.abs(templeLocation - shrineLocation);
    const distanceXToTemple = Math.abs(templeLocation - currentX);
    // Note: distanceTempleToShrine is identical to distanceShrineToTemple,
    // but explicitly calculated for clarity in path definition.
    const distanceTempleToShrine = Math.abs(shrineLocation - templeLocation);

    // Path 1: Travel from X to Shrine, then from Shrine to Temple
    const pathOneTotal = distanceXToShrine + distanceShrineToTemple;
    // Path 2: Travel from X to Temple, then from Temple to Shrine
    const pathTwoTotal = distanceXToTemple + distanceTempleToShrine;

    return Math.min(pathOneTotal, pathTwoTotal);
}

function ProcessInputAndSolve(inputData) {
    const POS_INF = Number.MAX_SAFE_INTEGER;
    const NEG_INF = -Number.MAX_SAFE_INTEGER; // Consistent with original's -INF magnitude

    let inputLines = inputData.split("\n");

    // Parse initial parameters using array destructuring and Number conversion
    const [countA, countB, numQueries] = inputLines.shift().split(/\s/).map(Number);

    let shrineLocations = [NEG_INF]; // Initialize with negative infinity sentinel
    for (let i = 0; i < countA; i++) {
        shrineLocations.push(Number(inputLines.shift()));
    }
    shrineLocations.push(POS_INF); // Add positive infinity sentinel

    let templeLocations = [NEG_INF]; // Initialize with negative infinity sentinel
    for (let j = 0; j < countB; j++) {
        templeLocations.push(Number(inputLines.shift()));
    }
    templeLocations.push(POS_INF); // Add positive infinity sentinel

    // The original `min` helper function is inlined by using `Math.min` directly.

    for (let qIdx = 0; qIdx < numQueries; qIdx++) {
        const queryLocation = Number(inputLines.shift());

        // Find the insertion points for the query location in both shrine and temple arrays
        const shrineInsertIndex = findInsertionPoint(shrineLocations, queryLocation);
        const templeInsertIndex = findInsertionPoint(templeLocations, queryLocation);

        let currentMinDistance = POS_INF;

        // Determine candidate shrine locations (the one before and at the insertion point)
        const candidateShrineOptions = [
            shrineLocations[shrineInsertIndex - 1],
            shrineLocations[shrineInsertIndex]
        ];

        // Determine candidate temple locations (the one before and at the insertion point)
        const candidateTempleOptions = [
            templeLocations[templeInsertIndex - 1],
            templeLocations[templeInsertIndex]
        ];

        // Iterate through all four combinations of candidate shrines and temples
        for (const sLoc of candidateShrineOptions) {
            for (const tLoc of candidateTempleOptions) {
                // Calculate the minimum travel distance for the current (shrine, temple) pair
                const pathMin = calculateMinTravelDistance(queryLocation, sLoc, tLoc);
                currentMinDistance = Math.min(currentMinDistance, pathMin);
            }
        }
        console.log(currentMinDistance);
    }
}

ProcessInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
