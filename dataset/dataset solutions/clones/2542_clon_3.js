var InputParserFactory = (function () {
    function createInputParser(sourceString) {
        return new InputSourceProcessor(sourceString);
    }

    function InputSourceProcessor(sourceString) {
        this._sourceLines = sourceString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    function convertArrayToNumbers(arr) {
        return arr.map(item => +item);
    }

    InputSourceProcessor.prototype._prepareCurrentLineTokens = function () {
        let currentLine = this._sourceLines[this._currentLineIndex];
        if (typeof currentLine === "string") {
            this._sourceLines[this._currentLineIndex] = currentLine.split(" ").reverse();
        }
    };

    InputSourceProcessor.prototype._popNextToken = function () {
        this._prepareCurrentLineTokens();
        let currentLineTokens = this._sourceLines[this._currentLineIndex];
        let token = currentLineTokens.pop();
        if (!currentLineTokens.length) {
            this._currentLineIndex++;
        }
        return token;
    };

    InputSourceProcessor.prototype.readSingleValue = function (returnAsString) {
        let value = this._popNextToken();
        return returnAsString ? value : +value;
    };

    InputSourceProcessor.prototype.readLineValues = function (returnAsString) {
        let lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
        return returnAsString ? lineContent : convertArrayToNumbers(lineContent);
    };

    InputSourceProcessor.prototype.readMatrixValues = function (numRows, returnAsString) {
        let matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
        let parsedMatrix = matrixRows.map(row => row.split(" "));
        return returnAsString ? parsedMatrix : parsedMatrix.map(row => convertArrayToNumbers(row));
    };

    InputSourceProcessor.prototype.readRawLines = function (numRows, returnAsString) {
        let rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
        return returnAsString ? rawLines : convertArrayToNumbers(rawLines);
    };

    return createInputParser;
})();

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var dimensions = Array.prototype.slice.call(arguments, 1);
    var dimCount = dimensions.length;
    var arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(x=>{return ${initialValue};})`;

    while (--dimCount >= 0) {
        arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(x=>${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

function calculateGridCellValue(rowIndex, colIndex, colThreshold, isRowToggleActive) {
    let cellValue = 0;
    if (colIndex >= colThreshold) {
        cellValue = 1;
    }
    if (isRowToggleActive) {
        cellValue ^= 1;
    }
    return cellValue;
}

function formatResultGrid(grid) {
    return grid.map(row => row.join("")).join("\n");
}

console.log(main());

function main() {
    var heightVal = inputReader.readSingleValue();
    var widthVal = inputReader.readSingleValue();
    var colThreshold = inputReader.readSingleValue();
    var rowThreshold = inputReader.readSingleValue();

    var resultGrid = createMultiDimArray(0, heightVal, widthVal);

    for (var rowIndex = 0; rowIndex < heightVal; rowIndex++) {
        let isRowToggleActive = (rowIndex >= rowThreshold);
        
        for (var colIndex = 0; colIndex < widthVal; colIndex++) {
            resultGrid[rowIndex][colIndex] = calculateGridCellValue(rowIndex, colIndex, colThreshold, isRowToggleActive);
        }
    }

    return formatResultGrid(resultGrid);
}
