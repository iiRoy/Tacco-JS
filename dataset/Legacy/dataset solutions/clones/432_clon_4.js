const placeFirstEmpty = (targetArray, markValue) => {
    const contentSlice = targetArray.slice(1, -1);
    const targetRelativeIndex = contentSlice.findIndex(val => val === 0);
    if (targetRelativeIndex !== -1) {
        targetArray[targetRelativeIndex + 1] = markValue;
        return true;
    }
    return false;
};

const placeLastNonAdjacent = (sequenceContainer, fillChar) => {
    const searchResult = sequenceContainer.reduceRight((acc, currentVal, idx) => {
        if (acc.found) return acc;

        if (idx >= 1 && idx <= sequenceContainer.length - 2) {
            if (currentVal === 0 && sequenceContainer[idx - 1] !== "A" && sequenceContainer[idx + 1] !== "A") {
                return { index: idx, found: true };
            }
        }
        return acc;
    }, { index: -1, found: false });

    if (searchResult.found) {
        sequenceContainer[searchResult.index] = fillChar;
        return true;
    } else {
        return placeFirstEmpty(sequenceContainer, fillChar);
    }
};

const placeAdjacentOrCenter = (sequenceContainer, totalLength, fillChar) => {
    const contentSlice = sequenceContainer.slice(1, -1);
    const foundRelativeIndex = contentSlice.findIndex((val, relativeIdx) => {
        const actualIdx = relativeIdx + 1;
        return (val !== 0 && sequenceContainer[actualIdx + 1] === 0) ||
               (val !== 0 && sequenceContainer[actualIdx - 1] === 0);
    });

    if (foundRelativeIndex !== -1) {
        const actualIdx = foundRelativeIndex + 1;
        if (sequenceContainer[actualIdx + 1] === 0) {
            sequenceContainer[actualIdx + 1] = fillChar;
        } else {
            sequenceContainer[actualIdx - 1] = fillChar;
        }
        return true;
    } else {
        const centerPosition = (totalLength % 2 === 1) ? ((totalLength - 1) / 2 + 1) : (totalLength / 2 + 1);
        sequenceContainer[centerPosition] = fillChar;
        return true;
    }
};

const calculateEmptySpanRadius = (sequenceContainer, centerIndex) => {
    let leftEmptyCount = 0;
    for (let k = 1; ; k++) {
        const currentLeftIdx = centerIndex - k;
        if (currentLeftIdx < 0 || sequenceContainer[currentLeftIdx] === "X" || /[ABCD]/.test(sequenceContainer[currentLeftIdx])) {
            leftEmptyCount = k - 1;
            break;
        }
    }

    let rightEmptyCount = 0;
    for (let k = 1; ; k++) {
        const currentRightIdx = centerIndex + k;
        if (currentRightIdx >= sequenceContainer.length || sequenceContainer[currentRightIdx] === "X" || /[ABCD]/.test(sequenceContainer[currentRightIdx])) {
            rightEmptyCount = k - 1;
            break;
        }
    }
    return Math.min(leftEmptyCount, rightEmptyCount);
};

const placeWidestEmpty = (sequenceContainer, fillChar) => {
    let bestPlacement = { index: -1, score: -1 };

    for (let i = 1; i < sequenceContainer.length - 1; i++) {
        if (sequenceContainer[i] !== 0) continue;

        const currentScore = calculateEmptySpanRadius(sequenceContainer, i);

        if (currentScore > bestPlacement.score) {
            bestPlacement = { index: i, score: currentScore };
        }
    }

    if (bestPlacement.score > 0) {
        sequenceContainer[bestPlacement.index] = fillChar;
        return true;
    } else {
        return placeFirstEmpty(sequenceContainer, fillChar);
    }
};

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = inputData.trim().split("\n");

const operationDispatch = {
    "A": (seq, len) => placeFirstEmpty(seq, "A"),
    "B": (seq, len) => placeLastNonAdjacent(seq, "B"),
    "C": (seq, len) => placeAdjacentOrCenter(seq, len, "C"),
    "D": (seq, len) => placeWidestEmpty(seq, "D")
};

let linePointer = 0;
while (true) {
    const dimensions = inputLines[linePointer++].split(" ").map(Number);
    const currentN = dimensions[0];
    const currentM = dimensions[1];

    if (currentN === 0 && currentM === 0) break;

    let currentSequence = ["X", ...Array(currentN).fill(0), "X"];

    for (let k = 0; k < currentM; k++) {
        const operationType = inputLines[linePointer++];
        const handler = operationDispatch[operationType];
        if (handler) {
            handler(currentSequence, currentN);
        }
    }

    const finalOutput = currentSequence.slice(1, -1).join("").replace(/0/g, "#");
    console.log(finalOutput);
}
