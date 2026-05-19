const ASCII_OFFSET_FOR_COL_CHAR = 65; // ASCII value for 'A'
const TARGET_STRING_VALUE = "snuke";

function processInputData(rawInputString) {
    let lineSegments = rawInputString.split("\n");

    const gridDimensions = lineSegments[0].split(" ");
    const columnCount = parseInt(gridDimensions[1], 10);

    lineSegments.shift();

    const gridMatrix = transformTo2DArray(lineSegments);

    for (let rowIndex = 0; rowIndex < gridMatrix.length; rowIndex++) {
        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
            const currentCellContent = gridMatrix[rowIndex][colIndex];

            if (currentCellContent === TARGET_STRING_VALUE) {
                const columnCharacter = String.fromCharCode(ASCII_OFFSET_FOR_COL_CHAR + colIndex);
                const rowNumber = rowIndex + 1;

                console.log(columnCharacter + rowNumber);
                break;
            }
        }
    }
}

function transformTo2DArray(targetArray) {
    for (let i = 0; i < targetArray.length; i++) {
        targetArray[i] = targetArray[i].split(" ");
    }
    return targetArray;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
