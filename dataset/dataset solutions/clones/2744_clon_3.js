var INPUT_PARSER_FACTORY = (function () {
    function createInputParser(sourceString) {
        return new InputParser(sourceString);
    }

    class InputParser {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _processValue(value, returnAsString) {
            return returnAsString ? value : +value;
        }

        readNextToken(returnAsStringFlag) {
            let currentLineContent = this._sourceLines[this._currentLineIndex];
            let extractedToken;

            if (typeof currentLineContent === "string") {
                this._sourceLines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
            }

            extractedToken = this._sourceLines[this._currentLineIndex].pop();

            if (this._sourceLines[this._currentLineIndex].length === 0) {
                this._currentLineIndex++;
            }

            return this._processValue(extractedToken, returnAsStringFlag);
        }

        readLineTokens(returnAsStringFlag) {
            const lineContent = this._sourceLines[this._currentLineIndex++];
            const tokens = lineContent.split(" ");
            return returnAsStringFlag ? tokens : tokens.map(val => +val);
        }

        readMatrix(numRows, returnAsStringFlag) {
            const startRowIndex = this._currentLineIndex;
            const endRowIndex = this._currentLineIndex + numRows;
            this._currentLineIndex = endRowIndex;

            const rawRows = this._sourceLines.slice(startRowIndex, endRowIndex);
            const processedMatrix = rawRows.map(rowStr => {
                const rowTokens = rowStr.split(" ");
                return returnAsStringFlag ? rowTokens : rowTokens.map(val => +val);
            });
            return processedMatrix;
        }

        readLinesAsNumbers(numLines, returnAsStringFlag) {
            const startLineIndex = this._currentLineIndex;
            const endLineIndex = this._currentLineIndex + numLines;
            this._currentLineIndex = endLineIndex;

            const rawLines = this._sourceLines.slice(startLineIndex, endLineIndex);
            return returnAsStringFlag ? rawLines : rawLines.map(val => +val);
        }
    }

    return createInputParser;
})();

var inputReader = INPUT_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        expression = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        expression = "Array(args[" + argCount + "]).fill(0).map(x=>" + expression + ")";
    }
    return eval(expression);
}

function findUpperBoundIndex(searchArray, startIndex, endIndex, searchValue) {
    let currentLow = startIndex;
    let currentHigh = endIndex;
    let midIndex;

    while (1 < currentHigh - currentLow) {
        midIndex = Math.floor((currentLow + currentHigh) / 2);
        if (searchArray[midIndex] <= searchValue) {
            currentLow = midIndex;
        } else {
            currentHigh = midIndex;
        }
    }
    return searchArray[currentLow] <= searchValue ? currentHigh : currentLow;
}

console.log(processInput());

function processInput() {
    const totalItems = inputReader.readNextToken();
    const dataValues = inputReader.readLinesAsNumbers(totalItems);

    let resultSequence = [1]; // Stores the smallest end element of increasing subsequences.

    const updateResultSequence = (itemValue, sequence) => {
        const negatedItemValue = -itemValue;
        const insertionPoint = findUpperBoundIndex(sequence, 0, sequence.length, negatedItemValue);
        sequence[insertionPoint] = negatedItemValue;
    };

    for (let idx = 0; idx < totalItems; idx++) {
        updateResultSequence(dataValues[idx], resultSequence);
    }

    return resultSequence.length;
}
