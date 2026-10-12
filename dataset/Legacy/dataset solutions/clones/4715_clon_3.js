function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const dimensionString = inputLines[0];
    const dimensionParts = dimensionString.split(" ");
    const gridSizeN = parseInt(dimensionParts[0], 10);
    const patternSizeM = parseInt(dimensionParts[1], 10);

    const buildPatternMatrix = (sourceLines, startLineIndex, matrixSize) => {
        const matrixResult = [];
        for (let rowIndex = 0; rowIndex < matrixSize; rowIndex++) {
            const currentLineData = sourceLines[startLineIndex + rowIndex];
            const rowCharacters = [];
            for (let colIndex = 0; colIndex < matrixSize; colIndex++) {
                rowCharacters.push(currentLineData[colIndex]);
            }
            matrixResult.push(rowCharacters);
        }
        return matrixResult;
    };

    const targetPatternMatrix = buildPatternMatrix(inputLines, gridSizeN + 1, patternSizeM);

    let isMatchFound = false;

    const checkSubgridMatch = (mainGridSourceLines, patternMatrix, currentGridRowOffset, currentGridColOffset, patternDimension) => {
        for (let patternRow = 0; patternRow < patternDimension; patternRow++) {
            for (let patternCol = 0; patternCol < patternDimension; patternCol++) {
                const gridChar = mainGridSourceLines[currentGridRowOffset + 1 + patternRow][currentGridColOffset + patternCol];
                const patternChar = patternMatrix[patternRow][patternCol];
                if (gridChar !== patternChar) {
                    return false;
                }
            }
        }
        return true;
    };

    outerSearchLoop:
    for (let searchRowOffset = 0; searchRowOffset <= gridSizeN - patternSizeM; searchRowOffset++) {
        for (let searchColOffset = 0; searchColOffset <= gridSizeN - patternSizeM; searchColOffset++) {
            if (checkSubgridMatch(inputLines, targetPatternMatrix, searchRowOffset, searchColOffset, patternSizeM)) {
                isMatchFound = true;
                break outerSearchLoop;
            }
        }
    }

    if (isMatchFound) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
