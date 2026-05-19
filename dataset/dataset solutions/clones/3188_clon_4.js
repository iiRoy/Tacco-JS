class DataProcessor {
    constructor(sourceContent) {
        this._sourceLines = sourceContent.trim().split('\n');
        this._lineIndex = 0;
        this._activeLineTokens = null; // Stores tokens for the current line when processing right-to-left
    }

    // Reads a single token from the current line, from right to left.
    // Advances to the next line if the current one is exhausted.
    extractRightmost(asNumeric) {
        if (this._lineIndex >= this._sourceLines.length) {
            throw new Error("Input stream exhausted for rightmost extraction.");
        }

        // If _activeLineTokens is null or empty, initialize it for the current line
        if (this._activeLineTokens === null || this._activeLineTokens.length === 0) {
            this._activeLineTokens = this._sourceLines[this._lineIndex].split(' ').reverse();
        }

        const extractedValue = this._activeLineTokens.pop();

        // If the current line's tokens are fully consumed, advance to the next line
        if (this._activeLineTokens.length === 0) {
            this._lineIndex++;
            this._activeLineTokens = null; // Reset for the next line
        }

        return asNumeric ? +extractedValue : extractedValue;
    }

    // Reads all tokens from the current line, from left to right.
    // Advances to the next line.
    extractFullLine(asNumeric) {
        if (this._lineIndex >= this._sourceLines.length) {
            throw new Error("Input stream exhausted for full line extraction.");
        }

        // For `extractFullLine`, we always read the original string line.
        // The `_activeLineTokens` state is only for `extractRightmost` and does not affect `extractFullLine`
        // as per the original code's behavior where `l()` always splits the raw string.
        const currentLineContent = this._sourceLines[this._lineIndex];
        this._lineIndex++; // Advance to the next line

        const tokens = currentLineContent.split(' ');

        return asNumeric ? tokens.map(Number) : tokens;
    }

    // Reads N lines, each split into tokens, forming a matrix.
    extractMatrix(rowCount, asNumeric) {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            resultMatrix.push(this.extractFullLine(asNumeric));
        }
        return resultMatrix;
    }

    // Reads N raw lines without splitting them into tokens.
    extractRawLines(rowCount, asNumeric) {
        const rawLines = [];
        for (let i = 0; i < rowCount; i++) {
            if (this._lineIndex >= this._sourceLines.length) {
                throw new Error("Input stream exhausted for raw line extraction.");
            }
            const line = this._sourceLines[this._lineIndex];
            this._lineIndex++;
            rawLines.push(asNumeric ? +line : line);
        }
        return rawLines;
    }
}

// Factory function to create an instance of DataProcessor
function createInputSource(inputString) {
    return new DataProcessor(inputString);
}

var inputReader = createInputSource(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processInputData());

function processInputData() {
    const totalParticipants = inputReader.extractRightmost();
    const totalItems = inputReader.extractRightmost();

    let itemCounts = Array(totalItems).fill(0);

    // Process each participant's preferences using functional iteration
    Array.from({ length: totalParticipants }).forEach(() => {
        const participantPreferences = inputReader.extractFullLine();
        const numPreferredItems = participantPreferences[0];

        // Increment counts for each preferred item
        participantPreferences.slice(1, numPreferredItems + 1).forEach(itemIdentifier => {
            itemCounts[itemIdentifier - 1]++;
        });
    });

    // Determine how many items were preferred by all participants
    const universallyPreferredItems = itemCounts.filter(count => count === totalParticipants).length;

    return universallyPreferredItems;
}
