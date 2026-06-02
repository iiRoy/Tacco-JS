const InputParserFactory = (function() {
    const _parseNumericValue = (value, asString) => asString ? value : +value;

    class DataInputParser {
        constructor(sourceText) {
            this._lines = sourceText.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _prepareCurrentLineForAtomRead() {
            const currentLineContent = this._lines[this._currentLineIndex];
            if (typeof currentLineContent === "string") {
                this._lines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
            }
        }

        readNextValue(returnAsString) {
            this._prepareCurrentLineForAtomRead();
            const currentLineTokens = this._lines[this._currentLineIndex];
            const extractedValue = currentLineTokens.pop();

            if (currentLineTokens.length === 0) {
                this._currentLineIndex++;
            }
            return _parseNumericValue(extractedValue, returnAsString);
        }

        readLineValues(returnAsStrings) {
            const lineContent = this._lines[this._currentLineIndex++];
            const values = lineContent.split(" ");
            return returnAsStrings ? values : values.map(val => _parseNumericValue(val, false));
        }

        readMatrixRows(numberOfRows, returnAsStrings) {
            const startIdx = this._currentLineIndex;
            const endIdx = startIdx + numberOfRows;
            this._currentLineIndex = endIdx;

            const rawRows = this._lines.slice(startIdx, endIdx);
            const parsedRows = rawRows.map(line => line.split(" "));

            return returnAsStrings ? parsedRows : parsedRows.map(row => row.map(val => _parseNumericValue(val, false)));
        }

        readMultipleLines(numberOfLines, returnAsStrings) {
            const startIdx = this._currentLineIndex;
            const endIdx = startIdx + numberOfLines;
            this._currentLineIndex = endIdx;

            const rawLines = this._lines.slice(startIdx, endIdx);
            return returnAsStrings ? rawLines : rawLines.map(line => _parseNumericValue(line, false));
        }
    }

    return function createInputParser(sourceString) {
        return new DataInputParser(sourceString);
    };
})();

const inputProcessor = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processFoodPreferences());

function processFoodPreferences() {
    const numPeople = inputProcessor.readNextValue();
    const numFoods = inputProcessor.readNextValue();

    const foodPreferenceCounts = Array(numFoods).fill(0);
    let commonFoodCount = 0;

    const recordPersonFoodPreferences = (personFoodList) => {
        const numberOfPreferredFoods = personFoodList[0];
        const preferredFoodItems = personFoodList.slice(1, numberOfPreferredFoods + 1);
        
        preferredFoodItems.forEach(foodId => {
            const foodIndex = foodId - 1;
            foodPreferenceCounts[foodIndex]++;
        });
    };

    for (let personIndex = 0; personIndex < numPeople; personIndex++) {
        const currentPersonFoods = inputProcessor.readLineValues();
        recordPersonFoodPreferences(currentPersonFoods);
    }

    foodPreferenceCounts.forEach(count => {
        if (count === numPeople) {
            commonFoodCount++;
        }
    });

    return commonFoodCount;
}
