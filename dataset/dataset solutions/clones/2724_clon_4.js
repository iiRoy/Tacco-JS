const fs = require("fs");

const rawInput = fs.readFileSync("/dev/stdin", "utf8").trim();
const parts = rawInput.split(/\s+/).map(Number);
let ptr = 0;

const totalItems = parts[ptr++];
const repetitionCount = parts[ptr++];
const sourceValues = parts.slice(ptr, ptr + totalItems);

const positionsByValue = new Map();

for (let index = 0; index < totalItems; index++) {
    const value = sourceValues[index];

    if (!positionsByValue.has(value)) {
        positionsByValue.set(value, []);
    }

    positionsByValue.get(value).push(index);
}

function lowerBound(list, target) {
    let left = 0;
    let right = list.length;

    while (left < right) {
        const middle = (left + right) >> 1;

        if (list[middle] < target) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }

    return left;
}

function reduceFrom(startIndex) {
    const reduced = [];

    for (let scan = startIndex; scan < totalItems; scan++) {
        const value = sourceValues[scan];
        const positions = positionsByValue.get(value);
        const nextPosition = lowerBound(positions, scan + 1);

        if (nextPosition < positions.length) {
            scan = positions[nextPosition];
        } else {
            reduced.push(value);
        }
    }

    return reduced;
}

function printSequence(sequence) {
    if (sequence.length > 0) {
        console.log(sequence.join(" "));
    }
}

let currentSequence = reduceFrom(0);

if (repetitionCount === 1 || currentSequence.length === 0) {
    printSequence(currentSequence);
    process.exit(0);
}

const discoveredStarts = new Set([currentSequence[0]]);
const firstValues = [undefined, currentSequence[0]];

let cycleIndex = 1;

while (cycleIndex < repetitionCount) {
    const starter = firstValues[cycleIndex];
    const starterPositions = positionsByValue.get(starter);
    const starterPosition = starterPositions[lowerBound(starterPositions, 0)];

    const nextSequence = [];
    let trackingNewStarts = false;

    for (let scan = starterPosition + 1; scan < totalItems; scan++) {
        const value = sourceValues[scan];
        const positions = positionsByValue.get(value);
        const nextPosition = lowerBound(positions, scan + 1);

        if (nextPosition < positions.length) {
            scan = positions[nextPosition];
            trackingNewStarts = false;
        } else {
            nextSequence.push(value);

            if (trackingNewStarts) {
                if (!discoveredStarts.has(value)) {
                    cycleIndex++;
                    firstValues.push(value);
                } else {
                    trackingNewStarts = false;
                }
            }

            if (nextSequence.length === 1) {
                discoveredStarts.add(value);
                firstValues.push(value);
                trackingNewStarts = true;
            }
        }
    }

    currentSequence = nextSequence;

    if (currentSequence.length === 0) {
        break;
    }

    cycleIndex++;
}

if (currentSequence.length === 0) {
    cycleIndex++;
}

const remainder = repetitionCount % cycleIndex;

if (remainder === 0) {
    printSequence(currentSequence);
    process.exit(0);
}

let restartPosition = 0;

if (remainder !== 1) {
    const starter = firstValues[remainder - 1];
    const starterPositions = positionsByValue.get(starter);
    restartPosition = starterPositions[lowerBound(starterPositions, 0)] + 1;
}

printSequence(reduceFrom(restartPosition));