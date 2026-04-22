const readRawData = () => require("fs").readFileSync("/dev/stdin", "utf8");

function* provideLines(rawData) {
    const cleansedData = rawData.trim();
    const allLines = cleansedData.split("\n");
    for (const singleLine of allLines) {
        yield singleLine;
    }
}

const convertToNumericArray = (textSegment) => textSegment.split(" ").map(Number);
const convertToCharacterArray = (textSegment) => [...textSegment];

const conveyResult = (message) => console.log(message);
const reportIssue = (problem) => console.error(problem);

const analyzeGridPattern = () => {
    const rawInputContent = readRawData();
    const lineIterator = provideLines(rawInputContent);

    const sizeInfo = convertToNumericArray(lineIterator.next().value);
    const gridRows = sizeInfo[0];
    const gridCols = sizeInfo[1];

    const characterGrid = [];
    for (let currentLineIndex = 0; currentLineIndex < gridRows; currentLineIndex++) {
        const rowString = lineIterator.next().value;
        characterGrid.push(convertToCharacterArray(rowString));
    }

    const hashSymbolCount = characterGrid.reduce((totalSymbols, currentRow) => {
        return totalSymbols + currentRow.filter(symbol => symbol === '#').length;
    }, 0);

    if (hashSymbolCount === gridRows + gridCols - 1) {
        conveyResult("Possible");
    } else {
        conveyResult("Impossible");
    }
};

analyzeGridPattern();