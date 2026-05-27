const parseGridDimensions = (lineParts) => {
    const rows = parseInt(lineParts[0], 10);
    const cols = parseInt(lineParts[1], 10);
    const threshold = parseInt(lineParts[2], 10);
    return { numRows: rows, numCols: cols, maxSumThreshold: threshold };
};

const padBinaryString = (binaryStr, targetLength) => {
    return '0'.repeat(Math.max(0, targetLength - binaryStr.length)) + binaryStr;
};

const createZeroFilledArray = (length) => Array(length).fill(0);

function vectorOperation(vecA, vecB, operationType) {
    const resultVector = [];
    // In the context of this problem's usage, vecA and vecB (prefix sum arrays)
    // will always have the same length (numCols + 1).
    // The original code's length check and modification for vecB is effectively dead code.
    for (let index = 0; index < vecA.length; index++) {
        switch (operationType) {
            case '+':
                resultVector.push(vecA[index] + vecB[index]);
                break;
            case '-':
                resultVector.push(vecA[index] - vecB[index]);
                break;
            case '*':
                resultVector.push(vecA[index] * vecB[index]);
                break;
            case '/':
                resultVector.push(vecA[index] / vecB[index]);
                break;
            case '%':
                resultVector.push(vecA[index] % vecB[index]);
                break;
            case '||':
                resultVector.push(Math.max(vecA[index], vecB[index]));
                break;
        }
    }
    return resultVector;
}

function processInput(rawData) {
    const parsedLines = rawData.trim().split("\n").map(line => line.split(" "));

    const { numRows, numCols, maxSumThreshold } = parseGridDimensions(parsedLines[0]);

    const prefixSumsGrid = Array.from({ length: numRows }, (_, rowIndex) => {
        const rowString = parsedLines[rowIndex + 1][0];
        const rowValues = rowString.split("").map(char => parseInt(char, 10));
        const rowPrefixSums = [0];
        let currentRunningSum = 0;
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            currentRunningSum += rowValues[colIndex];
            rowPrefixSums.push(currentRunningSum);
        }
        return rowPrefixSums;
    });

    const numHorizontalCutOptions = numRows - 1;
    let minTotalCuts = (numRows - 1) + (numCols - 1);

    const totalCombinations = Math.pow(2, numHorizontalCutOptions);

    mainCombinationLoop:
    for (let combinationIndex = 0; combinationIndex < totalCombinations; combinationIndex++) {
        let currentGroupPrefixSums = [prefixSumsGrid[0].slice()];

        const binaryRepresentation = padBinaryString(combinationIndex.toString(2), numHorizontalCutOptions);
        let horizontalCutCount = 0;

        for (let cutPositionIndex = 0; cutPositionIndex < numHorizontalCutOptions; cutPositionIndex++) {
            const shouldCutHorizontally = (binaryRepresentation[cutPositionIndex] === '1');
            const nextRowDataIndex = cutPositionIndex + 1;

            if (shouldCutHorizontally) {
                currentGroupPrefixSums.push(prefixSumsGrid[nextRowDataIndex].slice());
                horizontalCutCount++;
            } else {
                const lastGroupIdx = currentGroupPrefixSums.length - 1;
                currentGroupPrefixSums[lastGroupIdx] = vectorOperation(
                    currentGroupPrefixSums[lastGroupIdx],
                    prefixSumsGrid[nextRowDataIndex],
                    '+'
                );
            }
        }

        let columnGroupPrefixSums = createZeroFilledArray(currentGroupPrefixSums.length);
        let verticalCutPositions = [];

        const isInvalidVerticalCutAttempt = (currentColIdx, lastCutColIdx) => {
            return currentColIdx === 1 || lastCutColIdx === currentColIdx - 1;
        };

        columnIterationLoop:
        for (let currentColumnIdx = 1; currentColumnIdx <= numCols; currentColumnIdx++) {
            for (let groupIdx = 0; groupIdx < currentGroupPrefixSums.length; groupIdx++) {
                const currentSegmentSum = currentGroupPrefixSums[groupIdx][currentColumnIdx] - columnGroupPrefixSums[groupIdx];

                if (currentSegmentSum > maxSumThreshold) {
                    const lastVerticalCutCol = verticalCutPositions.length > 0 ? verticalCutPositions[verticalCutPositions.length - 1] : -1;
                    if (isInvalidVerticalCutAttempt(currentColumnIdx, lastVerticalCutCol)) {
                        continue mainCombinationLoop;
                    }

                    verticalCutPositions.push(currentColumnIdx - 1);

                    columnGroupPrefixSums = currentGroupPrefixSums.map(group => group[currentColumnIdx - 1]);
                    
                    currentColumnIdx--;
                    break columnIterationLoop;
                }
            }
        }
        minTotalCuts = Math.min(minTotalCuts, horizontalCutCount + verticalCutPositions.length);
    }
    console.log(minTotalCuts);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
