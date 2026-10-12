const FILE_PATH = '/dev/stdin';
const MAX_POSSIBLE_VALUE = 255;
const MIN_POSSIBLE_VALUE = 0;
const INVALID_COST_MARKER = -1;
const INITIAL_DP_STATE_VALUE = 128;
const TERMINATION_SIGNAL = "0 0";

const clampValue = (val, lowerBound, upperBound) => {
    if (val < lowerBound) return lowerBound;
    if (val > upperBound) return upperBound;
    return val;
};

const rawInputData = require('fs').readFileSync(FILE_PATH, 'utf8');
let inputLines = rawInputData.trim().split("\n");

while (true) {
    const currentDimensionsStr = inputLines.shift();
    if (currentDimensionsStr === TERMINATION_SIGNAL) {
        break;
    }

    const dimensionParts = currentDimensionsStr.split(" ");
    const countN = parseInt(dimensionParts[0], 10);
    const countM = parseInt(dimensionParts[1], 10);

    const mSequence = [];
    for (let mIdx = 0; mIdx < countM; mIdx++) {
        mSequence.push(parseInt(inputLines.shift(), 10));
    }

    const nSequence = [];
    for (let nIdx = 0; nIdx < countN; nIdx++) {
        nSequence.push(parseInt(inputLines.shift(), 10));
    }

    const memoizationTable = [];
    for (let rowIdx = 0; rowIdx <= countN; rowIdx++) {
        memoizationTable[rowIdx] = new Array(MAX_POSSIBLE_VALUE + 1).fill(INVALID_COST_MARKER);
    }
    memoizationTable[0][INITIAL_DP_STATE_VALUE] = 0;

    for (let currentNIdx = 1; currentNIdx <= countN; currentNIdx++) {
        for (let prevMVal = MIN_POSSIBLE_VALUE; prevMVal <= MAX_POSSIBLE_VALUE; prevMVal++) {
            if (memoizationTable[currentNIdx - 1][prevMVal] === INVALID_COST_MARKER) {
                continue;
            }

            const costFromPreviousState = memoizationTable[currentNIdx - 1][prevMVal];
            const targetNValue = nSequence[currentNIdx - 1];

            for (let mSeqIdx = 0; mSeqIdx < countM; mSeqIdx++) {
                const mDelta = mSequence[mSeqIdx];
                const potentialNextMVal = prevMVal + mDelta;
                const actualNextMVal = clampValue(potentialNextMVal, MIN_POSSIBLE_VALUE, MAX_POSSIBLE_VALUE);

                const difference = targetNValue - actualNextMVal;
                const squaredDifferenceCost = difference * difference;

                const totalCurrentCost = costFromPreviousState + squaredDifferenceCost;

                if (memoizationTable[currentNIdx][actualNextMVal] === INVALID_COST_MARKER) {
                    memoizationTable[currentNIdx][actualNextMVal] = totalCurrentCost;
                } else {
                    memoizationTable[currentNIdx][actualNextMVal] = Math.min(
                        memoizationTable[currentNIdx][actualNextMVal],
                        totalCurrentCost
                    );
                }
            }
        }
    }

    let finalMinimumCost = Infinity;
    const lastRow = memoizationTable[countN];

    for (let col = MIN_POSSIBLE_VALUE; col <= MAX_POSSIBLE_VALUE; col++) {
        const currentCostValue = lastRow[col];
        if (currentCostValue !== INVALID_COST_MARKER) {
            finalMinimumCost = Math.min(finalMinimumCost, currentCostValue);
        }
    }
    console.log(finalMinimumCost);
}
