const createInputProcessor = (function() {
    const convertToNumber = (val) => +val;
    const splitLineBySpace = (line) => line.split(" ");

    function DataStreamHandler(sourceContent) {
        this._inputLines = sourceContent.trim().split("\n");
        this._currentLinePointer = 0;
    }

    DataStreamHandler.prototype.readNextItem = function(returnAsString) {
        let currentLineData = this._inputLines[this._currentLinePointer];
        let itemValue;

        if (typeof currentLineData === "string") {
            this._inputLines[this._currentLinePointer] = splitLineBySpace(currentLineData);
        }

        itemValue = this._inputLines[this._currentLinePointer].shift();

        if (this._inputLines[this._currentLinePointer].length === 0) {
            this._currentLinePointer++;
        }

        return returnAsString ? itemValue : convertToNumber(itemValue);
    };

    DataStreamHandler.prototype.readFullLine = function(returnStrings) {
        const lineContent = this._inputLines[this._currentLinePointer++];
        const parts = splitLineBySpace(lineContent);
        return returnStrings ? parts : parts.map(convertToNumber);
    };

    DataStreamHandler.prototype.readMatrixBlock = function(numRows, returnStrings) {
        const matrixResult = [];
        for (let i = 0; i < numRows; i++) {
            const lineContent = this._inputLines[this._currentLinePointer++];
            const parts = splitLineBySpace(lineContent);
            matrixResult.push(returnStrings ? parts : parts.map(convertToNumber));
        }
        return matrixResult;
    };

    DataStreamHandler.prototype.readLinesAsArray = function(numLines, returnStrings) {
        const linesArray = this._inputLines.slice(this._currentLinePointer, this._currentLinePointer + numLines);
        this._currentLinePointer += numLines;
        return returnStrings ? linesArray : linesArray.map(convertToNumber);
    };

    return function(inputString) {
        return new DataStreamHandler(inputString);
    };
})();

const inputReader = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processCoordinates());

function processCoordinates() {
    const coordinateData = inputReader.readMatrixBlock(3);

    const NO_MATCH_RESULT = "No";

    const checkRowConsistency = (baseRow, targetRow, expectedDifference) => {
        const diffY = targetRow[1] - baseRow[1];
        const diffZ = targetRow[2] - baseRow[2];
        return (diffY === expectedDifference) && (diffZ === expectedDifference);
    };

    const firstRowDiff = coordinateData[1][0] - coordinateData[0][0];
    if (!checkRowConsistency(coordinateData[0], coordinateData[1], firstRowDiff)) {
        return NO_MATCH_RESULT;
    }

    const secondRowDiff = coordinateData[2][0] - coordinateData[0][0];
    if (!checkRowConsistency(coordinateData[0], coordinateData[2], secondRowDiff)) {
        return NO_MATCH_RESULT;
    }

    return "Yes";
}
