const isVowelChar = (charToCheck) => {
    // Determine if a given character is a vowel (case-insensitive).
    // This helper function improves readability and modularity.
    return /[aeiouAEIOU]/.test(charToCheck);
};

// Utilize Node.js 'fs' module to synchronously read the entire input file.
// This is a common pattern in competitive programming for fast input processing.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input:
// 1. Trim any leading/trailing whitespace from the entire content.
// 2. Split the content into an array of lines.
// 3. Filter out any empty lines that might result from splitting or trimming.
let bufferedInputLines = rawInputContent.trim().split('\n').filter(line => line.length > 0);

// Initialize an index to keep track of the current line being processed from the buffer.
let currentProcessingIndex = 0;

// The main processing loop continues as long as there are lines left in the buffer.
// A do-while structure is used for clearer flow compared to an infinite loop with a break.
do {
    // Parse the first line of each dataset as the number of entries for that dataset.
    // Use parseInt with radix 10 for explicit and safe number conversion.
    const numberOfStringsInDataset = parseInt(bufferedInputLines[currentProcessingIndex++], 10);

    // If the dataset size is 0, it signifies the end of input, so terminate the program.
    if (numberOfStringsInDataset === 0) {
        break;
    }

    // Extract the actual string entries for the current dataset.
    // `slice` is used to get the relevant part without modifying the original array yet.
    const currentDatasetStrings = bufferedInputLines.slice(currentProcessingIndex, currentProcessingIndex + numberOfStringsInDataset);
    // Advance the processing index past the strings just consumed.
    currentProcessingIndex += numberOfStringsInDataset;

    // A Set is used to store the unique derived prefixes.
    // Sets automatically handle uniqueness, which is more efficient than object keys for this purpose.
    const derivedPrefixSet = new Set();
    let maximumDerivedPrefixLength = 0; // Tracks the length of the longest derived prefix found.

    // Iterate through each string in the current dataset to generate its specific prefix.
    for (const singleInputString of currentDatasetStrings) {
        // Basic validation: skip if the string is empty or not a string.
        // (Though competitive programming typically assumes valid input).
        if (typeof singleInputString !== 'string' || singleInputString.length === 0) {
            continue;
        }

        let accumulatingPrefix = singleInputString[0]; // The prefix always begins with the first character.
        let wasPreviousCharVowel = isVowelChar(singleInputString[0]); // State for the previous character.

        // Build the prefix by iterating from the second character onwards.
        for (let charIterator = 1; charIterator < singleInputString.length; ++charIterator) {
            // Append the current character to the prefix ONLY if the character immediately before it was a vowel.
            if (wasPreviousCharVowel) {
                accumulatingPrefix += singleInputString[charIterator];
            }
            // Update the vowel status based on the current character, for the next iteration.
            wasPreviousCharVowel = isVowelChar(singleInputString[charIterator]);
        }

        // Add the generated unique prefix to our set.
        derivedPrefixSet.add(accumulatingPrefix);
        // Update the maximum length found among all derived prefixes.
        maximumDerivedPrefixLength = Math.max(maximumDerivedPrefixLength, accumulatingPrefix.length);
    }

    // --- Type III Logic Additions / Updates ---

    // Guard clause: If the number of unique derived prefixes is less than the original dataset size,
    // it means some input strings yielded identical derived prefixes. In this case,
    // it's impossible to distinguish all strings, so output -1 immediately.
    if (derivedPrefixSet.size < numberOfStringsInDataset) {
        console.log(-1);
        continue; // Proceed to the next dataset.
    }

    // Optimization: If there's only one string in the dataset, a prefix length of 1 is always sufficient.
    if (numberOfStringsInDataset === 1) {
        console.log(1);
        continue; // Proceed to the next dataset.
    }

    let minimumDistinguishingLengthFound = false;
    // Search for the smallest prefix length 'k' that makes all derived prefixes unique.
    // Iterate 'k' from 1 up to the maximum derived prefix length found.
    for (let currentTestLength = 1; currentTestLength <= maximumDerivedPrefixLength; ++currentTestLength) {
        // A temporary set to store the truncated unique substrings for the current 'k'.
        const truncatedUniqueSubstrings = new Set();

        // For each full derived prefix, take its substring of length 'k'.
        for (const fullDerivedPrefix of derivedPrefixSet) {
            // Use substring to extract the part; it handles lengths gracefully.
            const shortenedPrefix = fullDerivedPrefix.substring(0, currentTestLength);
            truncatedUniqueSubstrings.add(shortenedPrefix);
        }

        // If the number of unique truncated prefixes equals the original dataset size,
        // then 'currentTestLength' is the smallest distinguishing length.
        if (truncatedUniqueSubstrings.size === numberOfStringsInDataset) {
            console.log(currentTestLength);
            minimumDistinguishingLengthFound = true;
            break; // Exit the inner loop as the answer has been found.
        }
    }

    // If the loop completes without finding a distinguishing length, output -1.
    if (!minimumDistinguishingLengthFound) {
        console.log(-1);
    }

} while (currentProcessingIndex < bufferedInputLines.length); // Loop until all lines are processed.