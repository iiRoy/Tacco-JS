const analyzeAndCountComponents = (sourceInputString) => {

    // Early exit for empty or whitespace-only input.
    if (!sourceInputString || sourceInputString.trim().length === 0) {
        console.log(0);
        return;
    }

    // Split the raw input into an array of individual lines.
    // We filter out any lines that are empty or contain only whitespace to ensure valid data.
    const inputLines = sourceInputString.split('\n').filter(lineContent => lineContent.trim() !== '');

    // If, after filtering, no valid lines remain, there are no components to count.
    if (inputLines.length === 0) {
        console.log(0);
        return;
    }

    // Transform each valid line into an array of its constituent string elements (identifiers).
    // For example, "A B" becomes ["A", "B"]. This structure is used for direct element access.
    const identifierPairs = inputLines.map(currentLine => currentLine.split(' '));

    // For each line, create a Set containing its identifiers.
    // Using Sets allows for efficient O(1) average-time lookups when checking for shared elements.
    const elementCollections = inputLines.map(currentLine => new Set(currentLine.split(' ')));

    // Initialize the count of distinct components.
    // Initially, every line (or pair of identifiers) is considered a unique component.
    let finalComponentCount = identifierPairs.length;

    /**
     * Helper function to determine if either of two specified elements exists within a given Set.
     * This encapsulates the core connection logic for improved readability.
     *
     * @param {Set<string>} targetSet - The set to search within.
     * @param {string} elementOne - The first element to check for.
     * @param {string} elementTwo - The second element to check for.
     * @returns {boolean} True if elementOne or elementTwo is found in targetSet, false otherwise.
     */
    const checkSetForElements = (targetSet, elementOne, elementTwo) => {
        // Perform the lookup. If either element is present, a connection is established.
        return targetSet.has(elementOne) || targetSet.has(elementTwo);
    };

    // Begin iterating through the identifier pairs, starting from the second pair (index 1).
    // The goal is to compare each pair with all preceding pairs to find connections.
    for (let currentPairIndex = 1; currentPairIndex < identifierPairs.length; ++currentPairIndex) {

        // Extract the specific elements from the current pair being evaluated.
        // These serve as temporary variables to enhance code clarity.
        const firstValueFromCurrentPair = identifierPairs[currentPairIndex][0];
        const secondValueFromCurrentPair = identifierPairs[currentPairIndex][1];

        // Inner loop: Compare the current pair (at `currentPairIndex`) with all pairs that came before it.
        for (let precedingPairIndex = 0; precedingPairIndex < currentPairIndex; ++precedingPairIndex) {

            // Obtain the Set of elements corresponding to the preceding pair for comparison.
            const comparisonSet = elementCollections[precedingPairIndex];

            // Utilize the helper function to check if the current pair shares any elements
            // with the preceding pair's collection.
            const isConnectedToPreviousComponent = checkSetForElements(
                comparisonSet,
                firstValueFromCurrentPair,
                secondValueFromCurrentPair
            );

            // If a connection is detected, it means the component represented by `currentPairIndex`
            // is not distinct but rather merges with an already existing or previously merged component.
            // Therefore, we decrement the overall count of distinct components.
            if (isConnectedToPreviousComponent) {
                finalComponentCount--;
                // Once a connection is found for the `currentPairIndex`, there's no need to check
                // against other preceding pairs. We can move to the next `currentPairIndex`.
                break;
            }
        }
    }

    // Output the final calculated number of distinct components to standard output.
    console.log(finalComponentCount);
};

// Standard boilerplate for reading input from the file system, specifically stdin.
const fileStreamModule = require('fs');
const standardInputFilePath = '/dev/stdin';

// Read the entire content of the standard input file, decode it as UTF-8,
// and remove any leading or trailing whitespace.
const rawInputContent = fileStreamModule.readFileSync(standardInputFilePath, 'utf8').trim();

// Invoke the main processing function with the prepared input data.
analyzeAndCountComponents(rawInputContent);