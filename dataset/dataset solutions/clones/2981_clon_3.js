const InputProcessor = (function() {
    function initializeSourceReader(rawInputContent) {
        return new DataSegmentParser(rawInputContent);
    }

    class DataSegmentParser {
        constructor(contentString) {
            this.contentLines = contentString.trim().split("\n");
            this.currentContentLineIndex = 0;
            this.cachedTokensForCurrentLine = [];
        }

        // Reads the next token from the current line, moving to the next line if current is exhausted.
        // Original behavior: `split(" ").reverse().pop()` means it reads tokens from left to right.
        extractNextToken(returnAsText = false) {
            // If the cache is empty, or all tokens from the current line have been consumed,
            // load the next line into the cache.
            if (this.cachedTokensForCurrentLine.length === 0) {
                if (this.currentContentLineIndex >= this.contentLines.length) {
                    return undefined; // No more data to read
                }
                const lineData = this.contentLines[this.currentContentLineIndex++];
                this.cachedTokensForCurrentLine = lineData.split(" ");
            }

            const retrievedToken = this.cachedTokensForCurrentLine.shift(); // Read from the beginning of the cache
            return returnAsText ? retrievedToken : Number(retrievedToken);
        }

        // Fetches all tokens from the current line.
        fetchEntireLineTokens(asStrings = false) {
            if (this.currentContentLineIndex >= this.contentLines.length) {
                return []; // No more lines
            }
            const completeLine = this.contentLines[this.currentContentLineIndex++];
            const tokens = completeLine.split(" ");
            return asStrings ? tokens : tokens.map(str => Number(str));
        }

        // Fetches a specified number of lines, splitting each into tokens, forming a matrix.
        fetchMultiLineMatrix(numberOfInputRows, asStrings = false) {
            const startIndex = this.currentContentLineIndex;
            const endIndex = startIndex + numberOfInputRows;
            if (endIndex > this.contentLines.length) {
                this.currentContentLineIndex = this.contentLines.length; // Advance pointer past remaining lines
                return [];
            }
            this.currentContentLineIndex = endIndex; // Advance pointer

            const rawMatrixRows = this.contentLines.slice(startIndex, endIndex);
            const processedMatrix = rawMatrixRows.map(line => {
                const rowElements = line.split(" ");
                return asStrings ? rowElements : rowElements.map(str => Number(str));
            });
            return processedMatrix;
        }

        // Fetches a specified number of raw lines.
        fetchSequentialRawLines(lineQuantity, asStrings = false) {
            const startPtr = this.currentContentLineIndex;
            const endPtr = startPtr + lineQuantity;
            if (endPtr > this.contentLines.length) {
                this.currentContentLineIndex = this.contentLines.length;
                return [];
            }
            this.currentContentLineIndex = endPtr;

            const selectedRawLines = this.contentLines.slice(startPtr, endPtr);
            return asStrings ? selectedRawLines : selectedRawLines.map(str => Number(str));
        }
    }

    return initializeSourceReader;
})();

const systemInputHandler = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Generates a nested array structure filled with a specified value.
// This replaces the original `xArray` which used `eval`.
function createNestingArray(fillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return fillValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        createNestingArray(fillValue, ...remainingDimensions)
    );
}

// Helper function to count internal "AB" sequences within a single string
const countInternalAB = (textSequence) => {
    let currentCount = 0;
    // Iterate through the string, comparing adjacent characters
    for (let charIdx = 0; charIdx < textSequence.length - 1; charIdx++) {
        if (textSequence[charIdx] === 'A' && textSequence[charIdx + 1] === 'B') {
            currentCount++;
        }
    }
    return currentCount;
};

// Helper function to categorize a string based on its start and end characters
const categorizeString = (inputString) => {
    const firstChar = inputString[0];
    const lastChar = inputString[inputString.length - 1];

    if (firstChar === 'B' && lastChar === 'A') {
        return 'B_A_TYPE'; // Starts with B, ends with A
    } else if (firstChar === 'B') {
        return 'B_START_ONLY'; // Starts with B, but not ends with A
    } else if (lastChar === 'A') {
        return 'A_END_ONLY'; // Ends with A, but not starts with B
    } else {
        return 'NEITHER_TYPE'; // Neither starts with B nor ends with A
    }
};

// Function to calculate the final result of the problem
function computeFinalScore() {
    const totalInputStringsCount = systemInputHandler.extractNextToken();

    // Basic validation / guard clause for no input strings
    if (totalInputStringsCount === 0) {
        return 0;
    }

    const stringCollection = systemInputHandler.fetchSequentialRawLines(totalInputStringsCount, true);

    let stringsEndingInAExclusive = 0; // Strings ending with 'A', but not starting with 'B'
    let stringsStartingInBExclusive = 0; // Strings starting with 'B', but not ending with 'A'
    let stringsStartingBEndingA = 0; // Strings starting with 'B' AND ending with 'A'
    let totalContainedABPairs = 0; // Count of "AB" pairs found within the strings themselves

    // Process each string in the collection
    for (const individualString of stringCollection) {
        totalContainedABPairs += countInternalAB(individualString); // Accumulate internal AB pairs

        // Categorize the string and update counters
        const stringCategory = categorizeString(individualString);
        switch (stringCategory) {
            case 'B_A_TYPE':
                stringsStartingBEndingA++;
                break;
            case 'B_START_ONLY':
                stringsStartingInBExclusive++;
                break;
            case 'A_END_ONLY':
                stringsEndingInAExclusive++;
                break;
            // 'NEITHER_TYPE' category doesn't affect linking counts
        }
    }

    // Determine the additional connections possible by linking strings
    const minimumLinkableEnds = Math.min(stringsEndingInAExclusive, stringsStartingInBExclusive);
    const hasAnyDirectLinkableEnds = (stringsEndingInAExclusive > 0 || stringsStartingInBExclusive > 0);

    let additionalLinkedPairs;
    if (hasAnyDirectLinkableEnds) {
        // If there are strings that can initiate or terminate a chain (A_END_ONLY or B_START_ONLY),
        // we can form 'minimumLinkableEnds' direct links.
        // All B_A_TYPE strings can then be inserted into any chain or form new ones.
        additionalLinkedPairs = minimumLinkableEnds + stringsStartingBEndingA;
    } else {
        // If all strings are either B_A_TYPE or NEITHER_TYPE (i.e., no A_END_ONLY or B_START_ONLY strings)
        // Only B_A_TYPE strings can be chained. If there are 'stringsStartingBEndingA' such strings,
        // they can form 'stringsStartingBEndingA - 1' links if stringsStartingBEndingA >= 1.
        // If stringsStartingBEndingA is 0, it contributes 0.
        additionalLinkedPairs = Math.max(0, stringsStartingBEndingA - 1);
    }

    // The final result is the sum of internal AB pairs and additional linked pairs
    return totalContainedABPairs + additionalLinkedPairs;
}

// Execute the main computation and display the outcome
console.log(computeFinalScore());