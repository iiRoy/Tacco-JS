// Helper function to transform a character array into a sorted string, representing its canonical anagram form.
const procureCanonicalRepresentation = (characterSequence) => {
    // Defensive check: ensure the input is indeed an array before attempting to sort.
    if (!Array.isArray(characterSequence)) {
        // In a production scenario, one might throw an error or handle more robustly.
        // For this context, a warning and empty string return suffice.
        console.warn("Input for canonical form generation was not an array. Received:", typeof characterSequence);
        return "";
    }
    // Create a new array from the character sequence to avoid modifying the original in-place,
    // then sort its elements alphabetically, and finally join them into a single string.
    const sortedElements = [...characterSequence].sort();
    return sortedElements.join('');
};

/**
 * Calculates the total number of combinations of anagrams within a given set of string arrays.
 * The calculation counts pairs (i, j) where i <= j and the anagram form of stringArrays[i]
 * is identical to the anagram form of stringArrays[j]. This is equivalent to summing
 * k * (k + 1) / 2 for each group of k identical anagram forms.
 *
 * @param {number} expectedEntryCount - The anticipated number of string arrays.
 * @param {Array<Array<string>>} collectionOfCharacterArrays - An array where each element is
 *   itself an array of characters (representing a string).
 * @returns {number} The total sum of anagram combinations.
 */
const computeAnagrammaticCombinations = (expectedEntryCount, collectionOfCharacterArrays) => {
    // Validate the expected entry count; negative values are illogical in this context.
    if (expectedEntryCount < 0) {
        console.error("Error: Provided entry count cannot be negative. Defaulting to 0 combinations.");
        return 0;
    }

    // Perform a consistency check between the declared count and the actual data length.
    // If they mismatch, prefer the actual data length for processing robustness.
    let actualDataLength = collectionOfCharacterArrays.length;
    if (expectedEntryCount !== actualDataLength) {
        console.warn(`Warning: Declared entry count (${expectedEntryCount}) does not match ` +
                     `actual data length (${actualDataLength}). Adjusting to actual length for processing.`);
        expectedEntryCount = actualDataLength; // Use the actual length for loop bounds.
    }

    // A Map is used to efficiently store and retrieve the frequency of each unique
    // canonical anagram form. Keys are the canonical strings, values are their counts.
    const anagramFrequencyMap = new Map();

    // Iterate through each character array in the input collection.
    for (let currentElementIndex = 0; currentElementIndex < expectedEntryCount; ++currentElementIndex) {
        const currentCharacterArray = collectionOfCharacterArrays[currentElementIndex];

        // Obtain the standardized, sorted string representation for the current array.
        const standardizedForm = procureCanonicalRepresentation(currentCharacterArray);

        // Update the count for this standardized form in our frequency map.
        // If the form hasn't been seen before, its count starts at 1.
        const existingFormCount = anagramFrequencyMap.get(standardizedForm) || 0;
        anagramFrequencyMap.set(standardizedForm, existingFormCount + 1);
    }

    let accumulatedResult = 0; // This variable will store the final sum of combinations.

    // Now, iterate through the counts of each unique anagram form stored in the map.
    for (const individualFormCount of anagramFrequencyMap.values()) {
        // For each group of 'k' identical anagrams, the number of combinations
        // (including self-pairs, as per original logic) is k * (k + 1) / 2.
        // This formula is derived from the sum of an arithmetic progression (1 + 2 + ... + k).
        const combinationsForCurrentGroup = (individualFormCount * (individualFormCount + 1)) / 2;
        accumulatedResult += combinationsForCurrentGroup;
    }

    return accumulatedResult;
};

// --- Input Acquisition and Initial Transformation ---

// Utilize Node.js 'fs' module to read all data from standard input synchronously.
// The input is expected to be UTF-8 encoded.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input buffer into an array of strings, using newline as the delimiter.
// This gives us each line of input as a separate array element.
const inputLineSegments = rawInputBuffer.split('\n');

// The very first line of input is expected to contain the integer 'N'.
// We parse this string to an integer, ensuring to trim any whitespace and specify base 10.
const numericalEntryCount = parseInt(inputLineSegments[0].trim(), 10);

// The subsequent lines (from index 1 onwards) are the actual string data.
// We process these lines:
// 1. Slice the array to exclude the first line (N).
// 2. Filter out any potentially empty lines that might result from trailing newlines.
// 3. Map each remaining line string into an array of its individual characters.
const processedCharacterCollections = inputLineSegments.slice(1)
                                                       .filter(lineText => lineText.length > 0)
                                                       .map(lineText => Array.from(lineText));

// --- Execution and Output ---

// Invoke the core logic function with the prepared input data.
const finalComputedValue = computeAnagrammaticCombinations(numericalEntryCount, processedCharacterCollections);

// Display the ultimate result to standard output.
// The original code had a typo 'console.lof', which is corrected here to 'console.log'.
console.log(finalComputedValue);