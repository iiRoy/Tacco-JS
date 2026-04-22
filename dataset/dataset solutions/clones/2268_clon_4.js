class InputProcessor {
    constructor(sourceText) {
        this.contentLines = sourceText.split('\n');
    }

    // Helper method to access a specific line by its index
    retrieveLine(idx) {
        return this.contentLines[idx];
    }

    // Determines the starting index in `this.contentLines` for the summation process.
    // This involves identifying a target key and finding its position.
    resolveSummationStart() {
        // The key to search for is located in the second-to-last line of the input.
        const searchAnchor = this.retrieveLine(this.contentLines.length - 2);

        // Construct a list of primary identifiers from the data lines.
        // These are the first words of lines from index 1 up to (length - 3).
        // The original `splice` operation effectively extracts this range.
        const searchableIdentifiers = this.contentLines
            .slice(1, this.contentLines.length - 2)
            .map(lineItem => lineItem.split(' ')[0]);

        // Find the zero-based index of the `searchAnchor` within the `searchableIdentifiers` list.
        // If not found, `relativeIndex` will be -1.
        const relativeIndex = searchableIdentifiers.findIndex(id => id === searchAnchor);

        // Calculate the absolute starting index for summation in the `this.contentLines` array.
        // If `searchAnchor` was not found (`relativeIndex` is -1), summation starts from the first data line (index 1).
        // Otherwise, it starts two lines after the line containing the `searchAnchor`.
        // `relativeIndex` in `searchableIdentifiers` corresponds to `relativeIndex + 1` in `this.contentLines`.
        // The summation then begins at `(relativeIndex + 1) + 2`, which simplifies to `relativeIndex + 3`.
        return relativeIndex === -1 ? 1 : relativeIndex + 3;
    }

    // Executes the primary calculation, summing values from specified lines.
    computeAggregateValue() {
        const startPoint = this.resolveSummationStart();
        // The summation stops before the second-to-last line (which is the searchAnchor).
        // So, the slice end index (exclusive) is `contentLines.length - 2`.
        const endPointExclusive = this.contentLines.length - 2;

        // Extract the segment of lines that need to be summed.
        const segmentToSum = this.contentLines.slice(startPoint, endPointExclusive);

        // Use a reducer to accumulate the numerical values.
        const totalAccumulation = segmentToSum.reduce((currentSum, currentLine) => {
            const lineParts = currentLine.split(' ');
            // The original code implicitly handles cases where `lineParts[1]` might be undefined
            // or not a valid number, resulting in `NaN` propagating. We mimic this behavior.
            const numericalPart = Number(lineParts[1]);
            return currentSum + numericalPart;
        }, 0); // Initialize sum to zero.

        return totalAccumulation;
    }
}

// Self-executing anonymous function (IIFE) to run the main logic.
(() => {
    // Read the entire input from standard input as a string.
    const rawInputString = require("fs").readFileSync("/dev/stdin", "utf8");

    // Instantiate the processor with the raw input.
    const dataProcessor = new InputProcessor(rawInputString);

    // Perform the calculation and output the result to console.
    console.log(dataProcessor.computeAggregateValue());
})();