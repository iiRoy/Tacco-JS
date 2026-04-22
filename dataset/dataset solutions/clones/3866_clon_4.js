const processInputData = (sourceText) => {
    const lines = sourceText.split('\n');
    const matrixDimension = Number(lines[0]);
    const coreStringsData = lines.slice(1, matrixDimension + 1).map(textLine => textLine + textLine);
    return { matrixDimension, coreStringsData };
};

const evaluatePattern = (dimensionSize, primaryContent, rowShiftVal, colShiftVal) => {
    const indicesSequence = Array.from({ length: dimensionSize }, (_, idx) => idx);

    return indicesSequence.every(firstIdx =>
        indicesSequence.slice(firstIdx + 1).every(secondIdx => {
            const firstRowPos = firstIdx + rowShiftVal;
            const firstColPos = secondIdx + colShiftVal;
            const secondRowPos = secondIdx + colShiftVal;
            const secondColPos = firstIdx + rowShiftVal;

            const characterA = primaryContent[firstRowPos % dimensionSize][firstColPos];
            const characterB = primaryContent[secondRowPos % dimensionSize][secondColPos];

            return characterA === characterB;
        })
    ) ? 1 : 0;
};

const calculateTotalScore = (dimensionSize, primaryContent) => {
    const rowOffsets = Array.from({ length: dimensionSize }, (_, k) => k);

    const scoresMatrix = rowOffsets.map(rOffset =>
        Array.from({ length: dimensionSize }, (_, k) => k).map(cOffset =>
            evaluatePattern(dimensionSize, primaryContent, rOffset, cOffset)
        )
    );

    return scoresMatrix.flat().reduce((sum, currentScore) => sum + currentScore, 0);
};

const runComputation = (inputString) => {
    const { matrixDimension, coreStringsData } = processInputData(inputString);
    const finalScore = calculateTotalScore(matrixDimension, coreStringsData);
    console.log(finalScore);
};

runComputation(require("fs").readFileSync("/dev/stdin","utf8"));