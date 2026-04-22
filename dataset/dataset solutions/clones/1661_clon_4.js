let incomingData = '';
process.stdin.on('data', segment => { incomingData += segment; });
process.stdin.on('end', () => {
    const finalOutcome = initiateAnalysis(incomingData);
    if (finalOutcome !== undefined) {
        console.log(String(finalOutcome));
    }
});

const UNIVERSAL_LIMIT_VAL = 1000000000;
const DISTANCE_MODIFIER = 5;
const NO_INTERSECTION_MSG = "SAFE";

class DataExtractor {
    constructor(sourceString) {
        this.tokenArray = sourceString.split(/\s+/).filter(token => token.length > 0);
        this.currentPosition = 0;
    }

    fetchNumeric() {
        return Number(this.tokenArray[this.currentPosition++]);
    }

    fetchLiteral() {
        return this.tokenArray[this.currentPosition++];
    }
}

const initiateAnalysis = (rawDataContent) => {
    const extractor = new DataExtractor(rawDataContent);
    const objectCount = extractor.fetchNumeric();

    const collectionOfPointObjects = [];
    for (let c = 0; c < objectCount; c++) {
        const xVal = extractor.fetchNumeric();
        const yVal = extractor.fetchNumeric();
        const orientationStr = extractor.fetchLiteral();
        collectionOfPointObjects.push({
            coordX: xVal,
            coordY: yVal,
            diffDiag: xVal - yVal,
            sumDiag: xVal + yVal,
            direction: orientationStr
        });
    }

    let leastEncounterValue = UNIVERSAL_LIMIT_VAL;

    const findClosestIntersection = (
        groupA,
        groupB,
        keyForPrimarySort,
        keyForSecondaryCompare,
        resultFactor
    ) => {
        let bestLocalValue = UNIVERSAL_LIMIT_VAL;

        // Create copies and sort them for this specific comparison
        const sortedGroupA = [...groupA].sort((p1, p2) => p1[keyForPrimarySort] - p2[keyForPrimarySort]);
        const sortedGroupB = [...groupB].sort((p1, p2) => p1[keyForPrimarySort] - p2[keyForPrimarySort]);

        let pointerB = 0;
        for (let idxA = 0; idxA < sortedGroupA.length; idxA++) {
            const pointA = sortedGroupA[idxA];

            // Advance pointerB to the first element in sortedGroupB whose primary sort key is >= pointA's primary sort key
            while (pointerB < sortedGroupB.length && sortedGroupB[pointerB][keyForPrimarySort] < pointA[keyForPrimarySort]) {
                pointerB++;
            }

            if (pointerB < sortedGroupB.length) {
                const candidateB = sortedGroupB[pointerB];

                // Check for equality on the primary sort key and correct inequality on the secondary key
                if (pointA[keyForPrimarySort] === candidateB[keyForPrimarySort] &&
                    pointA[keyForSecondaryCompare] < candidateB[keyForSecondaryCompare]) {
                    const currentCalculatedDistance = (candidateB[keyForSecondaryCompare] - pointA[keyForSecondaryCompare]) * resultFactor;
                    bestLocalValue = Math.min(bestLocalValue, currentCalculatedDistance);
                }
            }
        }
        return bestLocalValue;
    };

    // Filter into directional groups once
    const upwardMovers = collectionOfPointObjects.filter(p => p.direction === 'U');
    const rightwardMovers = collectionOfPointObjects.filter(p => p.direction === 'R');
    const downwardMovers = collectionOfPointObjects.filter(p => p.direction === 'D');
    const leftwardMovers = collectionOfPointObjects.filter(p => p.direction === 'L');

    // Scenario 1: Vertical/Horizontal Encounters
    // Up vs Down (same x-coord, Up below Down)
    leastEncounterValue = Math.min(leastEncounterValue,
        findClosestIntersection(upwardMovers, downwardMovers, 'coordX', 'coordY', 1));
    // Right vs Left (same y-coord, Right left of Left)
    leastEncounterValue = Math.min(leastEncounterValue,
        findClosestIntersection(rightwardMovers, leftwardMovers, 'coordY', 'coordX', 1));

    // Scenario 2: Diagonal Encounters (based on x+y sum)
    // Up vs Right (same x+y sum, Up below Right)
    leastEncounterValue = Math.min(leastEncounterValue,
        findClosestIntersection(upwardMovers, rightwardMovers, 'sumDiag', 'coordY', 2));
    // Down vs Left (same x+y sum, Down left of Left)
    leastEncounterValue = Math.min(leastEncounterValue,
        findClosestIntersection(downwardMovers, leftwardMovers, 'sumDiag', 'coordX', 2));

    // Scenario 3: Diagonal Encounters (based on x-y difference)
    // Up vs Left (same x-y diff, Up left of Left)
    leastEncounterValue = Math.min(leastEncounterValue,
        findClosestIntersection(upwardMovers, leftwardMovers, 'diffDiag', 'coordX', 2));
    // Right vs Down (same x-y diff, Right left of Down)
    leastEncounterValue = Math.min(leastEncounterValue,
        findClosestIntersection(rightwardMovers, downwardMovers, 'diffDiag', 'coordX', 2));

    return leastEncounterValue === UNIVERSAL_LIMIT_VAL ? NO_INTERSECTION_MSG : leastEncounterValue * DISTANCE_MODIFIER;
};