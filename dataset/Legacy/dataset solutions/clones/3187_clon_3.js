const InputParserFactory = (function () {
    function createInputParser(sourceText) {
        return new InputParser(sourceText);
    }

    class InputParser {
        constructor(rawInputString) {
            this._sourceLines = rawInputString.trim().split("\n");
            this._currentLineIndex = 0;
            this._lineTokenCache = new Map();
        }

        readSingleItem(returnAsString) {
            const currentLineIdx = this._currentLineIndex;
            let lineTokens;

            if (this._lineTokenCache.has(currentLineIdx)) {
                lineTokens = this._lineTokenCache.get(currentLineIdx);
            } else {
                const rawLine = this._sourceLines[currentLineIdx];
                if (typeof rawLine !== "string") {
                    throw new Error("Attempted to read from an invalid line.");
                }
                lineTokens = rawLine.split(" ");
                this._lineTokenCache.set(currentLineIdx, lineTokens);
            }

            const itemValue = lineTokens.shift();

            if (lineTokens.length === 0) {
                this._currentLineIndex++;
                this._lineTokenCache.delete(currentLineIdx);
            }

            return returnAsString ? itemValue : Number(itemValue);
        }

        readLineOfItems(returnAsStrings) {
            const currentLine = this._sourceLines[this._currentLineIndex++];
            const tokens = currentLine.split(" ");
            return returnAsStrings ? tokens : tokens.map(val => Number(val));
        }

        readMatrixOfItems(numRows, returnAsStrings) {
            const matrixRows = [];
            for (let i = 0; i < numRows; i++) {
                const line = this._sourceLines[this._currentLineIndex++];
                const tokens = line.split(" ");
                matrixRows.push(returnAsStrings ? tokens : tokens.map(val => Number(val)));
            }
            return matrixRows;
        }

        readLinesAsArray(numLines, returnAsStrings) {
            const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numLines);
            this._currentLineIndex += numLines;
            return returnAsStrings ? lines : lines.map(val => Number(val));
        }
    }

    return createInputParser;
})();

const inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    const numPeople = inputReader.readSingleItem();
    const numItems = inputReader.readSingleItem();

    const itemLikeCounts = new Array(numItems).fill(0);

    let allLikedItemsCount = 0;

    for (let personIndex = 0; personIndex < numPeople; personIndex++) {
        const personLikesList = inputReader.readLineOfItems();

        const likedItemsCountForPerson = personLikesList[0];

        for (let k = 0; k < likedItemsCountForPerson; k++) {
            const itemIndexToIncrement = personLikesList[k];
            itemLikeCounts[itemIndexToIncrement]++;
        }
    }

    itemLikeCounts.forEach(count => {
        if (count === numPeople) {
            allLikedItemsCount++;
        }
    });

    return allLikedItemsCount;
}
