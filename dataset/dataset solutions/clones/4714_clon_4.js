const fileSystem = require("fs");

function parseInputData(rawInputContent) {
    const inputLines = rawInputContent.trim().split('\n');
    let currentLineIndex = 0;

    const dimensions = inputLines[currentLineIndex++].split(' ').map(Number);
    const mainGridSize = dimensions[0];
    const patternGridSize = dimensions[1];

    const primaryGrid = inputLines.slice(currentLineIndex, currentLineIndex + mainGridSize);
    currentLineIndex += mainGridSize;

    const searchPattern = inputLines.slice(currentLineIndex, currentLineIndex + patternGridSize);

    return {
        mainDim: mainGridSize,
        patternDim: patternGridSize,
        mainMatrix: primaryGrid,
        patternMatrix: searchPattern
    };
}

function findPatternInGrid(parsedData) {
    const { mainDim, patternDim, mainMatrix, patternMatrix } = parsedData;

    if (patternDim > mainDim) {
        return false;
    }

    const isFound = Array.from({ length: mainDim - patternDim + 1 }).some((_, rowOffset) =>
        Array.from({ length: mainDim - patternDim + 1 }).some((__, colOffset) =>
            Array.from({ length: patternDim }).every((___, patternRowIndex) => {
                const mainGridSlice = mainMatrix[rowOffset + patternRowIndex].substring(colOffset, colOffset + patternDim);
                return patternMatrix[patternRowIndex] === mainGridSlice;
            })
        )
    );

    return isFound;
}

function executeSolution() {
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    const processedData = parseInputData(inputContent);
    const result = findPatternInGrid(processedData);
    console.log(result ? "Yes" : "No");
}

executeSolution();
