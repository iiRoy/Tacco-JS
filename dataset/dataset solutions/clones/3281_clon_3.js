const InputParserFactory = (function() {
    function convertToNumberIfApplicable(valueString, returnAsString) {
        return returnAsString ? valueString : +valueString;
    }

    class InputProcessor {
        constructor(sourceText) {
            this.sourceLines = sourceText.trim().split("\n");
            this.currentLinePointer = 0;
        }

        readSingleValue(returnAsString) {
            let linesBuffer = this.sourceLines;
            let linePointer = this.currentLinePointer;
            let extractedValue;

            if (typeof linesBuffer[linePointer] === "string") {
                linesBuffer[linePointer] = linesBuffer[linePointer].split(" ");
            }

            extractedValue = linesBuffer[linePointer].shift();

            if (linesBuffer[linePointer].length === 0) {
                this.currentLinePointer++;
            }
            return convertToNumberIfApplicable(extractedValue, returnAsString);
        }

        readFullLine(returnAsString) {
            const lineContent = this.sourceLines[this.currentLinePointer++];
            const lineElements = lineContent.split(" ");
            return returnAsString ? lineElements : lineElements.map(element => convertToNumberIfApplicable(element, false));
        }

        readMultipleLinesAsMatrix(numberOfRows, returnAsString) {
            const startIndex = this.currentLinePointer;
            const endIndex = startIndex + numberOfRows;
            const selectedRows = this.sourceLines.slice(startIndex, endIndex);
            this.currentLinePointer = endIndex;

            const processedMatrix = selectedRows.map(rowString => {
                const rowValues = rowString.split(" ");
                return returnAsString ? rowValues : rowValues.map(value => convertToNumberIfApplicable(value, false));
            });
            return processedMatrix;
        }

        readRawLineBlock(numberOfLines, returnAsString) {
            const startIndex = this.currentLinePointer;
            const endIndex = startIndex + numberOfLines;
            const rawLineBlock = this.sourceLines.slice(startIndex, endIndex);
            this.currentLinePointer = endIndex;

            return returnAsString ? rawLineBlock : rawLineBlock.map(value => convertToNumberIfApplicable(value, false));
        }
    }

    return function(source) {
        return new InputProcessor(source);
    };
})();

const inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(main());

function main() {
    const totalItems = inputReader.readSingleValue();
    const limitA = inputReader.readSingleValue();
    const limitB = inputReader.readSingleValue();
    const itemValues = inputReader.readFullLine();

    let countForA = 0;
    let countForB = 0;

    const determineCategory = (value, lowerBound, upperBound) => {
        if (value <= lowerBound) {
            return 'categoryA';
        } else if (value > upperBound) {
            return 'categoryB';
        }
        return 'categoryC'; // Neither A nor B
    };

    for (let i = 0; i < totalItems; i++) {
        const currentItem = itemValues[i];
        const itemCategory = determineCategory(currentItem, limitA, limitB);

        if (itemCategory === 'categoryA') {
            countForA++;
        } else if (itemCategory === 'categoryB') {
            countForB++;
        }
    }

    const countForC = totalItems - countForA - countForB;
    return Math.min(countForA, countForB, countForC);
}
