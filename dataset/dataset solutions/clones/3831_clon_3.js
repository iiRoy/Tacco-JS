// A utility function designed to produce a list of unique elements
// from a given collection of items. It maintains the relative order
// of the first appearance of each unique element.
function eliminateDuplicates(inputCollection) {
    // We'll use a Set for efficient tracking of elements already encountered.
    // This provides O(1) average time complexity for checks and additions.
    const encounteredItems = new Set();

    // This array will store our final, distinct elements in their original order.
    const distinctElementsList = [];

    // Iterate over each item in the provided input collection.
    for (const currentItem of inputCollection) {
        // Check if the current item has not been seen before.
        if (!encounteredItems.has(currentItem)) {
            // If it's a new item, add it to our set of encountered items
            // and also append it to our list of distinct elements.
            encounteredItems.add(currentItem);
            distinctElementsList.push(currentItem);
        }
    }
    // Return the array containing only unique elements.
    return distinctElementsList;
}

// The primary execution function that processes raw data to find a specific
// lexicographically ordered substring.
function executeCoreLogic(rawData) {
    // Validate rawData presence; if not available, exit gracefully.
    if (!rawData || typeof rawData !== 'string') {
        console.log(''); // Output an empty string for invalid input.
        return;
    }

    // Split the entire input string into individual lines based on newline characters.
    const parsedInputSegments = rawData.split('\n');

    // Extract the main string from the first line of input.
    const mainSequence = parsedInputSegments[0];

    // Parse the target rank (K) from the second line, ensuring it's an integer.
    // Adding radix 10 for robust parsing.
    const targetRank = parseInt(parsedInputSegments[1], 10);

    // If the main sequence is empty or null, there are no substrings to generate.
    if (!mainSequence || mainSequence.length === 0) {
        console.log('');
        return;
    }

    // A list to hold all possible substrings generated from the main sequence.
    const allGeneratedSubstrings = [];

    // Outer loop: Determines the starting position of a substring.
    for (let startPosition = 0; startPosition < mainSequence.length; ++startPosition) {
        // Inner loop: Determines the length of the substring starting from 'startPosition'.
        // The length ranges from 1 up to the remaining characters from 'startPosition'.
        for (let currentLength = 1; startPosition + currentLength <= mainSequence.length; ++currentLength) {
            // Extract the substring using `substring` (equivalent to `slice` here, but different method name).
            const segment = mainSequence.substring(startPosition, startPosition + currentLength);
            allGeneratedSubstrings.push(segment);
        }
    }

    // Now, filter out any duplicate substrings from our generated list.
    // We use our custom utility function for this.
    const distinctSegments = eliminateDuplicates(allGeneratedSubstrings);

    // Perform validation for the target rank (K) against the number of distinct segments.
    // If K is out of bounds (zero, negative, or greater than available distinct segments),
    // or if no distinct segments were found, output an empty string.
    if (targetRank <= 0 || targetRank > distinctSegments.length || distinctSegments.length === 0) {
        console.log('');
        return;
    }

    // Sort the distinct substrings lexicographically.
    // JavaScript's default sort for strings is lexicographical.
    const sortedLexicographically = distinctSegments.sort();

    // The K-th smallest unique substring will be at index (K-1) in the sorted array.
    const desiredSubstringResult = sortedLexicographically[targetRank - 1];

    // Output the final result.
    console.log(desiredSubstringResult);
}

// Entry point for the script. Reads input from standard input (e.g., a file).
// Ensure that the file system module is available and the path is correct.
executeCoreLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));