class InputParser {
    constructor(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    readIntFromLineEnd(asString) {
        let lineContent = this.sourceLines[this.currentLineIndex];
        if (typeof lineContent === "string") {
            this.sourceLines[this.currentLineIndex] = lineContent.split(" ").reverse();
        }
        const extractedValue = this.sourceLines[this.currentLineIndex].shift();
        if (!this.sourceLines[this.currentLineIndex].length) {
            this.currentLineIndex++;
        }
        return asString ? extractedValue : Number(extractedValue);
    }

    readIntsFromLine(asString) {
        const lineElements = this.sourceLines[this.currentLineIndex++].split(" ");
        return asString ? lineElements : lineElements.map(Number);
    }

    readMatrix(numLines, asString) {
        const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numLines);
        return matrixRows.map(row => {
            const rowValues = row.split(" ");
            return asString ? rowValues : rowValues.map(Number);
        });
    }

    readIntsAsArray(numLines, asString) {
        const arrayElements = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numLines);
        return asString ? arrayElements : arrayElements.map(Number);
    }
}

function createInputParser(sourceString) {
    return new InputParser(sourceString);
}

const parserInstance = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());

function solveProblem() {
    const lineCount = parserInstance.readIntFromLineEnd();
    const inputArray = parserInstance.readIntsAsArray(lineCount);

    let dynamicProgrammingTable = [];

    function calculateTransformedValue(inputValue, transformKey) {
        switch (transformKey) {
            case 0:
            case 4:
                return inputValue;
            case 2:
                return (inputValue + 1) % 2;
            default:
                return inputValue === 0 ? 2 : inputValue % 2;
        }
    }

    for (let colIndex = 0; colIndex < 5; colIndex++) {
        dynamicProgrammingTable[colIndex] = calculateTransformedValue(inputArray[0], colIndex);
    }

    for (let rowIndex = 1; rowIndex < lineCount; rowIndex++) {
        const currentInputVal = inputArray[rowIndex];
        const currentDPRow = Array(5).fill(9e99);

        currentDPRow[0] = dynamicProgrammingTable[0] + currentInputVal;

        for (let colIndex = 1; colIndex < 5; colIndex++) {
            const transformedValForCurrentInput = calculateTransformedValue(currentInputVal, colIndex);
            let minValForCurrentCell = 9e99;

            for (let prevColIndex = 0; prevColIndex <= colIndex; prevColIndex++) {
                const candidateValue = dynamicProgrammingTable[prevColIndex] + transformedValForCurrentInput;
                if (candidateValue < minValForCurrentCell) {
                    minValForCurrentCell = candidateValue;
                }
            }
            currentDPRow[colIndex] = minValForCurrentCell;
        }
        dynamicProgrammingTable = currentDPRow;
    }

    return Math.min(...dynamicProgrammingTable);
}
