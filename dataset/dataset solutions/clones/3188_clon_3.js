const InputProcessor = (function () {

    function parseValueToNumberOrString(value, returnRawString) {
        if (returnRawString) {
            return value;
        }
        const numericValue = Number(value);
        if (isNaN(numericValue)) {
            // If conversion fails, return original string as a number (NaN)
            // This matches the behavior of unary plus operator `+value` for non-numeric strings
            return +value;
        }
        return numericValue;
    }

    function createStreamHandler(sourceTextContent) {
        if (typeof sourceTextContent !== 'string') {
            // Added validation for robust input
            throw new Error("Input for stream handler must be a string.");
        }
        return new StreamDataParser(sourceTextContent);
    }

    class StreamDataParser {
        constructor(fullInputContent) {
            this._rawInputLines = fullInputContent.trim().split("\n");
            this._linePointer = 0;
            this._cachedLineTokens = []; // Stores tokens for the current line being processed
        }

        _moveToNextLineTokens() {
            if (this._linePointer >= this._rawInputLines.length) {
                return []; // No more lines
            }
            const currentLine = this._rawInputLines[this._linePointer++];
            return currentLine.split(" ");
        }

        extractSingleValue(asStringFlag = false) {
            if (this._cachedLineTokens.length === 0) {
                this._cachedLineTokens = this._moveToNextLineTokens();
                if (this._cachedLineTokens.length === 0) {
                    // No more tokens or lines
                    return undefined;
                }
            }

            const token = this._cachedLineTokens.shift();
            return parseValueToNumberOrString(token, asStringFlag);
        }

        retrieveLineValues(asStringFlag = false) {
            // Ensure any remaining tokens from a previous single value extraction are cleared
            this._cachedLineTokens = []; 
            const lineTokens = this._moveToNextLineTokens();
            return lineTokens.map(token => parseValueToNumberOrString(token, asStringFlag));
        }

        getMultiLineTable(numberOfLines, asStringFlag = false) {
            // Guard clause for invalid number of lines
            if (numberOfLines <= 0) {
                return [];
            }
            // Clear any cached tokens before reading new lines
            this._cachedLineTokens = []; 

            const endPointer = this._linePointer + numberOfLines;
            if (endPointer > this._rawInputLines.length) {
                // Ensure we don't read past the end of the input
                throw new Error(`Requested to read ${numberOfLines} lines, but only ${this._rawInputLines.length - this._linePointer} remain.`);
            }

            const linesToProcess = this._rawInputLines.slice(this._linePointer, endPointer);
            this._linePointer = endPointer; // Advance line pointer

            return linesToProcess.map(line =>
                line.split(" ").map(token => parseValueToNumberOrString(token, asStringFlag))
            );
        }

        getSequentialValueBlock(numberOfLines, asStringFlag = false) {
            // Guard clause for invalid number of lines
            if (numberOfLines <= 0) {
                return [];
            }
            // Clear any cached tokens before reading new lines
            this._cachedLineTokens = []; 

            const endPointer = this._linePointer + numberOfLines;
            if (endPointer > this._rawInputLines.length) {
                throw new Error(`Requested to read ${numberOfLines} lines, but only ${this._rawInputLines.length - this._linePointer} remain.`);
            }

            const linesToProcess = this._rawInputLines.slice(this._linePointer, endPointer);
            this._linePointer = endPointer; // Advance line pointer

            // Assuming each line contains a single value for this method
            return linesToProcess.map(line => parseValueToNumberOrString(line, asStringFlag));
        }
    }

    return createStreamHandler;
})();

const dataStreamHandler = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainChallenge());

function processMainChallenge() {
    const totalParticipants = dataStreamHandler.extractSingleValue();
    const totalCategories = dataStreamHandler.extractSingleValue();

    // Extensive input validation and guard clauses
    if (totalParticipants === undefined || totalCategories === undefined || typeof totalParticipants !== 'number' || typeof totalCategories !== 'number' || isNaN(totalParticipants) || isNaN(totalCategories)) {
        // Log an error and return a default value or throw
        console.error("Error: Invalid or missing participant/category count. Please check input format.");
        return 0;
    }
    if (totalParticipants < 0 || totalCategories < 0) {
        console.error("Error: Counts cannot be negative. Returning 0.");
        return 0;
    }
    if (totalParticipants === 0 || totalCategories === 0) {
        // If no participants or no categories, no common items are possible
        return 0;
    }

    const categoryOccurrenceTracker = new Array(totalCategories).fill(0);
    let fullyCommonCategoriesCount = 0;

    for (let currentParticipantIndex = 0; currentParticipantIndex < totalParticipants; currentParticipantIndex++) {
        const participantSelections = dataStreamHandler.retrieveLineValues();

        if (!Array.isArray(participantSelections) || participantSelections.length === 0) {
            console.warn(`Warning: Skipping invalid or empty preference line for participant ${currentParticipantIndex + 1}.`);
            continue;
        }

        const numberOfItemsChosen = participantSelections[0];
        if (typeof numberOfItemsChosen !== 'number' || isNaN(numberOfItemsChosen) || numberOfItemsChosen < 0 || numberOfItemsChosen > participantSelections.length - 1) {
            console.warn(`Warning: Invalid item count specified for participant ${currentParticipantIndex + 1}. Expected ${numberOfItemsChosen}, but line has ${participantSelections.length - 1} items. Skipping.`);
            continue;
        }

        // Extract actual selected category IDs (excluding the count at index 0)
        const selectedCategoryIDs = participantSelections.slice(1, numberOfItemsChosen + 1);

        for (const categoryId of selectedCategoryIDs) {
            if (typeof categoryId !== 'number' || isNaN(categoryId)) {
                console.warn(`Warning: Non-numeric category ID '${categoryId}' found for participant ${currentParticipantIndex + 1}. Skipping this item.`);
                continue;
            }
            const zeroBasedCategoryIndex = categoryId - 1; // Adjust for 0-based array indexing

            // Validate category index bounds
            if (zeroBasedCategoryIndex >= 0 && zeroBasedCategoryIndex < totalCategories) {
                categoryOccurrenceTracker[zeroBasedCategoryIndex]++;
            } else {
                console.warn(`Warning: Category ID ${categoryId} (index ${zeroBasedCategoryIndex}) is out of bounds [0, ${totalCategories - 1}] for participant ${currentParticipantIndex + 1}. Skipping.`);
            }
        }
    }

    // Determine how many categories were selected by ALL participants
    fullyCommonCategoriesCount = categoryOccurrenceTracker.filter(count => count === totalParticipants).length;

    return fullyCommonCategoriesCount;
}