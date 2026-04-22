function processNavigationOutcome(travelJournal) {
    const journalEntries = travelJournal.split("\n");
    const movementSequence = journalEntries[0];
    const finalCoordinatesText = journalEntries[1].split(" ");

    const finalWaypoint = [
        Number(finalCoordinatesText[0]),
        Number(finalCoordinatesText[1])
    ];

    const courseSegments = [];
    let currentSegmentMagnitude = 0;
    for (let charPointer = 0; charPointer < movementSequence.length; charPointer++) {
        if (movementSequence[charPointer] === 'F') {
            currentSegmentMagnitude++;
        } else { // 'T'
            courseSegments.push(currentSegmentMagnitude);
            currentSegmentMagnitude = 0;
        }
    }
    courseSegments.push(currentSegmentMagnitude);

    const horizontalDisplacements = [];
    const verticalDisplacements = [];

    for (let segmentIterator = 0; segmentIterator < courseSegments.length; segmentIterator++) {
        if (segmentIterator % 2 === 0) {
            horizontalDisplacements.push(courseSegments[segmentIterator]);
        } else {
            verticalDisplacements.push(courseSegments[segmentIterator]);
        }
    }

    const accumulatePositions = (currentPositionSet, displacementAmount) => {
        const nextPositionSet = new Set();
        for (const currentCoordinate of currentPositionSet) {
            nextPositionSet.add(currentCoordinate + displacementAmount);
            if (displacementAmount !== 0) {
                nextPositionSet.add(currentCoordinate - displacementAmount);
            }
        }
        return nextPositionSet;
    };

    let horizontalSuccess;
    if (horizontalDisplacements.length === 0) {
        horizontalSuccess = (finalWaypoint[0] === 0);
    } else {
        const initialHorizontalState = new Set([horizontalDisplacements[0]]);
        const computedHorizontalStates = horizontalDisplacements.slice(1).reduce(accumulatePositions, initialHorizontalState);
        horizontalSuccess = computedHorizontalStates.has(finalWaypoint[0]);
    }

    let verticalSuccess;
    if (verticalDisplacements.length === 0) {
        verticalSuccess = (finalWaypoint[1] === 0);
    } else {
        const initialVerticalState = new Set([verticalDisplacements[0]]);
        const computedVerticalStates = verticalDisplacements.slice(1).reduce(accumulatePositions, initialVerticalState);
        verticalSuccess = computedVerticalStates.has(finalWaypoint[1]);
    }

    if (horizontalSuccess && verticalSuccess) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processNavigationOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));