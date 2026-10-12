const InputReaderFactory = (function() {
    function createParser(inputStringData) {
        return new InputParser(inputStringData);
    }

    class InputParser {
        constructor(inputStringData) {
            this.sourceLines = inputStringData.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readNextValue(returnAsString) {
            const linesArray = this.sourceLines;
            let lineIdx = this.currentLineIndex;
            let extractedValue;

            let currentLineContent = linesArray[lineIdx];

            if (typeof currentLineContent === "string") {
                linesArray[lineIdx] = currentLineContent.split(" ").reverse();
            }

            extractedValue = linesArray[lineIdx].pop();

            if (!linesArray[lineIdx].length) {
                this.currentLineIndex++;
            }

            if (returnAsString) {
                return extractedValue;
            } else {
                return +extractedValue;
            }
        }

        readLineValues(returnAsString) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const values = lineContent.split(" ");

            if (returnAsString) {
                return values;
            } else {
                const convertToNumber = (item) => +item;
                return values.map(convertToNumber);
            }
        }

        readMatrix(numRows, returnAsString) {
            const rawRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
            this.currentLineIndex += numRows;

            const processedRows = rawRows.map(row => row.split(" "));

            if (returnAsString) {
                return processedRows;
            } else {
                const convertRowToNumbers = (row) => row.map(item => +item);
                return processedRows.map(convertRowToNumbers);
            }
        }

        readRawLines(numLines, returnAsString) {
            const lines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines;

            if (returnAsString) {
                return lines;
            } else {
                const convertToNumber = (item) => +item;
                return lines.map(convertToNumber);
            }
        }
    }

    return createParser;
})();

const inputReaderInstance = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimensionalArray(initialValue) {
    const dimensions = arguments;
    let dimCount = dimensions.length;
    let arrayCreationCode = `Array(dimensions[${--dimCount}]).fill(0).map(x => { return ${initialValue}; })`;

    while (--dimCount) {
        arrayCreationCode = `Array(dimensions[${dimCount}]).fill(0).map(x => ${arrayCreationCode})`;
    }

    return eval(arrayCreationCode);
}

function solveProblem() {
    const firstValue = inputReaderInstance.readNextValue();
    const secondValue = inputReaderInstance.readNextValue();

    const doubledSecondValue = 2 * secondValue;

    const calculatedDifference = firstValue - doubledSecondValue;

    return Math.max(0, calculatedDifference);
}

console.log(solveProblem());
