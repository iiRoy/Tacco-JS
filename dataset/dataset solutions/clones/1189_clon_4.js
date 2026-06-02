"use strict";
const TOP_FACE = 0;
const SOUTH_FACE = 1;
const EAST_FACE = 2;
const WEST_FACE = 3;
const NORTH_FACE = 4;
const BOTTOM_FACE = 5;

const rollPermutations = new Map([
    ["N", [SOUTH_FACE, BOTTOM_FACE, EAST_FACE, WEST_FACE, TOP_FACE, NORTH_FACE]],
    ["S", [NORTH_FACE, TOP_FACE, EAST_FACE, WEST_FACE, BOTTOM_FACE, SOUTH_FACE]],
    ["W", [EAST_FACE, SOUTH_FACE, BOTTOM_FACE, TOP_FACE, NORTH_FACE, WEST_FACE]],
    ["E", [WEST_FACE, SOUTH_FACE, TOP_FACE, BOTTOM_FACE, NORTH_FACE, EAST_FACE]]
]);

function applyDiceRoll(currentFaces, direction) {
    const permutationIndices = rollPermutations.get(direction);
    const nextFaces = new Array(6);
    for (let i = 0; i < 6; i++) {
        nextFaces[i] = currentFaces[permutationIndices[i]];
    }
    return nextFaces;
}

function generateOrientationLookup(initialLabels) {
    const faceLookup = new Map();
    const visitedStates = new Set();
    const stateQueue = [initialLabels];

    const getUniqueStateKey = (faces) => faces.join(",");

    visitedStates.add(getUniqueStateKey(initialLabels));
    faceLookup.set(`${initialLabels[TOP_FACE]}_${initialLabels[SOUTH_FACE]}`, initialLabels[EAST_FACE]);

    let queuePointer = 0;
    while (queuePointer < stateQueue.length) {
        const currentOrientation = stateQueue[queuePointer++];

        for (const rollDirection of ["N", "S", "E", "W"]) {
            const nextOrientation = applyDiceRoll(currentOrientation, rollDirection);
            const nextStateIdentifier = getUniqueStateKey(nextOrientation);

            if (!visitedStates.has(nextStateIdentifier)) {
                visitedStates.add(nextStateIdentifier);
                stateQueue.push(nextOrientation);
                faceLookup.set(`${nextOrientation[TOP_FACE]}_${nextOrientation[SOUTH_FACE]}`, nextOrientation[EAST_FACE]);
            }
        }
    }
    return faceLookup;
}

function processDiceQueries(inputDataLines) {
    const startingLabels = inputDataLines[0].split(" ");
    const orientationMap = generateOrientationLookup(startingLabels);

    inputDataLines.slice(2).forEach(queryEntry => {
        const [desiredTop, desiredSouth] = queryEntry.split(" ");
        const queryKey = `${desiredTop}_${desiredSouth}`;
        console.log(orientationMap.get(queryKey));
    });
}

processDiceQueries(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));
