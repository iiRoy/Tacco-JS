var INPUT_PARSER = (function () {
    function createParser(inputString) {
        return new InputSource(inputString);
    }

    function InputSource(rawInput) {
        this._sourceLines = rawInput.trim().split("\n");
        this._currentLineIndex = 0;
    }

    InputSource.prototype.getNextValue = function (asString) {
        var lineData = this._sourceLines;
        var lineIdx = this._currentLineIndex;
        var extractedVal;

        if (typeof lineData[lineIdx] === "string") {
            lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
        }

        extractedVal = lineData[lineIdx].pop();

        if (!lineData[lineIdx].length) {
            this._currentLineIndex++;
        }
        return asString ? extractedVal : +extractedVal;
    };

    InputSource.prototype.getLineValues = function (asStrings) {
        var currentLine = this._sourceLines[this._currentLineIndex++].split(" ");
        return asStrings ? currentLine : currentLine.map(val => +val);
    };

    InputSource.prototype.getMatrix = function (numRows, asStrings) {
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
        return asStrings ? matrixRows : matrixRows.map(row => row.map(val => +val));
    };

    InputSource.prototype.getRows = function (numRows, asStrings) {
        var rowStrings = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
        return asStrings ? rowStrings : rowStrings.map(val => +val);
    };

    return createParser;
})();

var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var argsList = arguments;
    var argCount = argsList.length;
    var arrayCreationCode = "Array(argsList[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationCode = "Array(argsList[" + argCount + "]).fill(0).map(x=>" + arrayCreationCode + ")";
    }
    return eval(arrayCreationCode);
}

console.log(computeResult());

function computeResult() {
    var dimensionSize = inputReader.getNextValue();
    var resultMatrix = createMultiDimArray("[]", dimensionSize);

    for (var rowIterator = 0; rowIterator < dimensionSize; rowIterator++) {
        for (var colIterator = rowIterator + 1; colIterator < dimensionSize; colIterator++) {
            var powerOfTwo = 1;
            var xorResult = rowIterator ^ colIterator;
            while (xorResult % 2 === 0) {
                xorResult >>= 1;
                powerOfTwo++;
            }
            resultMatrix[rowIterator][colIterator - rowIterator - 1] = powerOfTwo;
        }
    }
    return resultMatrix.map(row => row.join(" ")).join("\n");
}
