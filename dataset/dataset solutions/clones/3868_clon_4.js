const retrievedContent = require("node:fs").readFileSync(0, "utf8").trimEnd();
const contentFragments = retrievedContent.split("\n");

const dimensionSize = Number(contentFragments[0]);
const dataMatrix = contentFragments.slice(1);

const getCyclicIndex = (value, upperLimit) => value % upperLimit;

const checkDiagonalSymmetry = (rowOffset, colOffset) => {
    const sequenceOfIndices = Array.from({ length: dimensionSize }, (_, index) => index);

    return sequenceOfIndices.every(primaryIndex =>
        sequenceOfIndices.every(secondaryIndex => {
            const charA = dataMatrix[getCyclicIndex(primaryIndex + rowOffset, dimensionSize)][getCyclicIndex(secondaryIndex + colOffset, dimensionSize)];
            const charB = dataMatrix[getCyclicIndex(secondaryIndex + rowOffset, dimensionSize)][getCyclicIndex(primaryIndex + colOffset, dimensionSize)];
            return charA === charB;
        })
    );
};

const resultsAccumulator = Array.from({ length: dimensionSize }, (_, currentShiftValue) => currentShiftValue)
    .reduce((currentTotal, rShift) => {
        return currentTotal + (checkDiagonalSymmetry(rShift, 0) ? dimensionSize : 0);
    }, 0);

console.log(resultsAccumulator);