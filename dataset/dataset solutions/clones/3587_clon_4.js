let gridHeight = 0;
let gridWidth = 0;

function processGridData(rawData) {
    const dataLines = rawData.split("\n");
    const dimensionsLine = dataLines[0].split(" ");
    gridHeight = Number(dimensionsLine[0]);
    gridWidth = Number(dimensionsLine[1]);

    const initialCharacterGrid = dataLines.slice(1)
        .filter(lineContent => lineContent.length > 0)
        .map(lineContent => lineContent.split(""));

    const isMarkableChar = (charValue) => charValue === '.' || charValue === 'n';

    const rowWouldBeMarked = Array.from({ length: gridHeight }, (_, rowIndex) =>
        initialCharacterGrid[rowIndex].every(isMarkableChar)
    );

    const colWouldBeMarked = Array.from({ length: gridWidth }, (_, colIndex) => {
        let allCharsMarkableInColumn = true;
        for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
            const effectiveChar = rowWouldBeMarked[rowIndex] ? 'n' : initialCharacterGrid[rowIndex][colIndex];
            if (!isMarkableChar(effectiveChar)) {
                allCharsMarkableInColumn = false;
                break;
            }
        }
        return allCharsMarkableInColumn;
    });

    const finalVisibleRowIndices = new Set();
    const finalVisibleColIndices = new Set();

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            if (initialCharacterGrid[rowIndex][colIndex] !== '.') {
                if (!rowWouldBeMarked[rowIndex] && !colWouldBeMarked[colIndex]) {
                    finalVisibleRowIndices.add(rowIndex);
                    finalVisibleColIndices.add(colIndex);
                }
            }
        }
    }

    const outputLinesBuffer = [];
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        if (finalVisibleRowIndices.has(rowIndex)) {
            const currentOutputRowChars = [];
            for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
                if (finalVisibleColIndices.has(colIndex)) {
                    currentOutputRowChars.push(initialCharacterGrid[rowIndex][colIndex]);
                }
            }
            if (currentOutputRowChars.length > 0) {
                outputLinesBuffer.push(currentOutputRowChars.join(""));
            }
        }
    }

    outputLinesBuffer.forEach(line => console.log(line));
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
