const createInputReader = (() => {
    const parseNumericValue = (val) => +val;

    class InputReader {
        constructor(rawInputContent) {
            this.sourceLines = rawInputContent.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readNextValue(returnAsStringFlag) {
            const lineContentArray = this.sourceLines[this.currentLineIndex];

            if (typeof lineContentArray === "string") {
                this.sourceLines[this.currentLineIndex] = lineContentArray.split(" ").reverse();
            }

            const processedLineParts = this.sourceLines[this.currentLineIndex];
            const extractedToken = processedLineParts.pop();

            if (processedLineParts.length === 0) {
                this.currentLineIndex++;
            }

            return returnAsStringFlag ? extractedToken : parseNumericValue(extractedToken);
        }

        readLineValues(returnAsStringFlag) {
            const lineString = this.sourceLines[this.currentLineIndex++];
            const tokens = lineString.split(" ");
            return returnAsStringFlag ? tokens : tokens.map(parseNumericValue);
        }

        readMatrix(numRows, returnAsStringFlag) {
            const rawMatrixLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
            this.currentLineIndex += numRows;
            const parsedMatrix = rawMatrixLines.map(line => line.split(" "));
            return returnAsStringFlag ? parsedMatrix : parsedMatrix.map(row => row.map(parseNumericValue));
        }

        readRawLines(numLines, returnAsStringFlag) {
            const lines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines;
            return returnAsStringFlag ? lines : lines.map(parseNumericValue);
        }
    }

    return (inputSource) => new InputReader(inputSource);
})();

const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialFillValue) {
    const dimensions = Array.from(arguments).slice(1);
    let currentDimIndex = dimensions.length;
    let arrayConstructionString = `Array(dimensions[${--currentDimIndex}]).fill(initialFillValue)`;

    while (--currentDimIndex >= 0) {
        arrayConstructionString = `Array(dimensions[${currentDimIndex}]).fill(0).map(element => ${arrayConstructionString})`;
    }
    return eval(arrayConstructionString);
}

function calculateVisibleBuildings() {
    const totalBuildings = inputReader.readNextValue();
    const buildingHeights = inputReader.readLineValues();

    if (totalBuildings === 0 || buildingHeights.length === 0) {
        return 0;
    }

    let countVisible = 0;
    let currentMaxHeight = 0;

    for (let i = 0; i < totalBuildings; i++) {
        const height = buildingHeights[i];
        if (currentMaxHeight <= height) {
            currentMaxHeight = height;
            countVisible++;
        }
    }
    return countVisible;
}

console.log(calculateVisibleBuildings());
