class InputReader {
    constructor(inputStringContent) {
        this._lines = inputStringContent.trim().split("\n");
        this._currentLineIndex = 0;
    }

    _convertValuesToNumbers(values, returnAsString) {
        return returnAsString ? values : values.map(val => +val);
    }

    readSingleValue(returnAsString) {
        let currentLineParts = this._lines[this._currentLineIndex];
        if (typeof currentLineParts === "string") {
            currentLineParts = currentLineParts.split(" ").reverse();
            this._lines[this._currentLineIndex] = currentLineParts;
        }
        const extractedValue = currentLineParts.pop();
        if (!currentLineParts.length) {
            this._currentLineIndex++;
        }
        return returnAsString ? extractedValue : +extractedValue;
    }

    readLineValues(returnAsString) {
        const lineContent = this._lines[this._currentLineIndex++];
        const values = lineContent.split(" ");
        return this._convertValuesToNumbers(values, returnAsString);
    }

    readMatrix(numRows, returnAsString) {
        const matrixRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
        this._currentLineIndex += numRows;
        const processedRows = matrixRows.map(rowStr => rowStr.split(" "));
        return returnAsString ? processedRows : processedRows.map(row => row.map(val => +val));
    }

    readRawLines(numRows, returnAsString) {
        const rawLines = this._lines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
        this._currentLineIndex += numRows;
        return this._convertValuesToNumbers(rawLines, returnAsString);
    }
}

const createInputReader = (inputSource) => new InputReader(inputSource);

const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    let currentK = inputReader.readSingleValue() - 1;
    const dataValues = inputReader.readLineValues();

    const valueAtInitialK = dataValues[currentK];
    currentK--;

    if (valueAtInitialK !== 2) {
        return -1;
    }

    let upperBound = 3;
    let lowerBound = 2;

    for (; currentK >= 0; currentK--) {
        const currentArrayValue = dataValues[currentK];

        if (currentArrayValue > upperBound) {
            return -1;
        }

        const lowerBoundCeilingFactor = Math.ceil(lowerBound / currentArrayValue);
        lowerBound = currentArrayValue * lowerBoundCeilingFactor;

        const upperBoundCeilingFactor = Math.ceil(upperBound / currentArrayValue);
        const firstTermForUpperBound = currentArrayValue * upperBoundCeilingFactor;
        const secondTermForUpperBound = lowerBound + currentArrayValue;
        upperBound = Math.max(firstTermForUpperBound, secondTermForUpperBound) - 1;
    }

    return `${lowerBound} ${upperBound}`;
}
