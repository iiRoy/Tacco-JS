var InputParserFactory = (function () {
    function createParser(sourceString) {
        return new InputParser(sourceString);
    }

    class InputParser {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _parseValue(val, asString) {
            return asString ? val : +val;
        }

        readSingleItem(returnAsString) {
            let currentLineArray = this._sourceLines[this._currentLineIndex];
            if (typeof currentLineArray === "string") {
                this._sourceLines[this._currentLineIndex] = currentLineArray.split(" ").reverse();
                currentLineArray = this._sourceLines[this._currentLineIndex];
            }

            const item = currentLineArray.pop();
            if (!currentLineArray.length) {
                this._currentLineIndex++;
            }
            return this._parseValue(item, returnAsString);
        }

        readLineItems(returnAsStrings) {
            const lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
            return returnAsStrings ? lineContent : lineContent.map(item => this._parseValue(item, false));
        }

        readMatrix(numRows, returnAsStrings) {
            const resultRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows)
                .map(line => line.split(" "));
            this._currentLineIndex += numRows;
            return returnAsStrings ? resultRows : resultRows.map(row => row.map(item => this._parseValue(item, false)));
        }

        readRawLines(numRows, returnAsStrings) {
            const resultLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
            this._currentLineIndex += numRows;
            return returnAsStrings ? resultLines : resultLines.map(line => this._parseValue(line, false));
        }
    }
    return createParser;
})();

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processInputData());

function processInputData() {
    var matrixSize = inputReader.readSingleItem();
    var dataRows = inputReader.readRawLines(matrixSize, true);

    function prepareCyclicData(originalData, size) {
        for (let idx = 0; idx < size; idx++) {
            originalData[idx + size] = originalData[idx];
        }
        return originalData;
    }

    dataRows = prepareCyclicData(dataRows, matrixSize);

    var totalSymmetricShifts = 0;

    function checkShiftSymmetry(data, size, currentOffset) {
        for (let rowIdx = 0; rowIdx < size; rowIdx++) {
            for (let colIdx = rowIdx + 1; colIdx < size; colIdx++) {
                if (data[rowIdx + currentOffset][colIdx] !== data[colIdx + currentOffset][rowIdx]) {
                    return false;
                }
            }
        }
        return true;
    }

    for (let currentOffset = 0; currentOffset < matrixSize; currentOffset++) {
        if (checkShiftSymmetry(dataRows, matrixSize, currentOffset)) {
            totalSymmetricShifts += matrixSize;
        }
    }

    return totalSymmetricShifts;
}
