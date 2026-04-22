(function(rawDataBlob) {
    // This script identifies common numerical elements between two lists.
    // It processes input from standard input, expecting specific formatting.

    // Preliminary check: Ensure there's valid input data to process.
    if (!rawDataBlob || typeof rawDataBlob !== 'string' || rawDataBlob.trim().length === 0) {
        // If input is absent or malformed, log an error and terminate execution.
        console.error("Input stream is empty or malformed; cannot proceed with data processing.");
        return;
    }

    // Divide the entire input string into an array of individual lines.
    const processedLines = rawDataBlob.split('\n');

    /**
     * @param {string} lineString - The raw string line to parse.
     * @param {number} expectedElementCount - The anticipated number of elements in the line.
     * @returns {number[]} An array of numbers parsed from the line.
     * @description Helper function to safely parse a space-separated string line into an array of numbers.
     */
    const convertLineToNumbers = (lineString, expectedElementCount) => {
        // Guard against processing empty or non-string lines.
        if (typeof lineString !== 'string' || lineString.trim().length === 0) {
            return [];
        }

        // Split the line by spaces and convert each part to a number.
        const stringParts = lineString.trim().split(' ');
        const numericResults = stringParts.slice(0, expectedElementCount).map(segment => {
            const numericValue = Number(segment);
            // Basic validation: if a segment isn't a number, treat it as zero to avoid NaNs.
            // In typical competitive programming, inputs are guaranteed valid.
            return isNaN(numericValue) ? 0 : numericValue;
        });
        return numericResults;
    };

    // Extract the first line, which denotes the size of the initial collection.
    const firstLineContent = processedLines.shift();
    const primaryCollectionSize = Number(firstLineContent);

    // Extract the second line containing the elements for the primary collection.
    const firstCollectionRaw = processedLines.shift();
    // Convert the first collection into a Set for efficient membership testing (O(1) average time complexity).
    const mainDataset = new Set(convertLineToNumbers(firstCollectionRaw, primaryCollectionSize));

    // Extract the third line, indicating the size of the secondary collection.
    const thirdLineContent = processedLines.shift();
    const secondaryCollectionSize = Number(thirdLineContent);

    // Extract the fourth line with elements for the secondary collection.
    const secondCollectionRaw = processedLines.shift();
    // Convert the second collection into a simple array.
    const comparisonTargets = convertLineToNumbers(secondCollectionRaw, secondaryCollectionSize);

    // Initialize a counter to keep track of elements found in both collections.
    let intersectionCount = 0;

    // Iterate through each item in the secondary collection.
    // Using a 'for...of' loop provides a clear and modern iteration method.
    for (const currentTarget of comparisonTargets) {
        // Check if the current target element exists within the main dataset.
        // The Set.has() method is highly optimized for this purpose.
        if (mainDataset.has(currentTarget)) {
            // If a match is found, increment the counter.
            intersectionCount++;
        }
    }

    // Convert the final count to a string for output.
    const finalResultOutput = String(intersectionCount);

    // Display the total number of common elements to the console.
    console.log(finalResultOutput);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));