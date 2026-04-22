// Function to thoroughly analyze an incoming string for a specific character distribution pattern.
function ProcessInputString(sourceString) {
    // A preliminary check to ensure the input data type is correct.
    // Although standard input usually guarantees a string, it's good practice.
    if (typeof sourceString !== 'string') {
        console.error("Input provided is not a string type. Cannot process.");
        return; // Terminate execution for invalid input type.
    }

    // The target pattern (two distinct characters, each appearing twice)
    // inherently requires a string length of exactly four characters.
    // Any string shorter than this cannot possibly match the pattern.
    if (sourceString.length < 4) {
        console.warn("Input string is too short to form a 'double-pair' pattern (minimum 4 characters required).");
        console.info('Negative'); // Output indicating the pattern is not found.
        return;
    }

    // Convert the source string into an array of its constituent characters.
    // Using the spread syntax for a slightly different approach than .split('').
    const characterSequence = [...sourceString];

    // Initialize an object to serve as a frequency map.
    // This map will store each unique character as a key and its count as a value.
    let characterFrequencyTracker = {};

    // Iterate over each character in the sequence to populate the frequency tracker.
    // Using forEach provides a clean, functional way to loop.
    characterSequence.forEach(currentSymbol => {
        // If the character has been seen before, increment its count.
        // Otherwise, initialize its count to 0 before incrementing to 1.
        characterFrequencyTracker[currentSymbol] = (characterFrequencyTracker[currentSymbol] || 0) + 1;
    });

    // Obtain an array of all unique characters found in the string.
    const uniqueCharacterKeys = Object.keys(characterFrequencyTracker);
    // Determine the number of distinct characters encountered.
    const numberOfDistinctChars = uniqueCharacterKeys.length;

    // The primary condition for our pattern is that there must be exactly two distinct characters.
    if (numberOfDistinctChars === 2) {
        // If there are exactly two unique characters, retrieve their specific keys.
        const firstKey = uniqueCharacterKeys[0];
        const secondKey = uniqueCharacterKeys[1];

        // Fetch the occurrence counts for these two distinct characters from our frequency map.
        const countForFirstChar = characterFrequencyTracker[firstKey];
        const countForSecondChar = characterFrequencyTracker[secondKey];

        // Now, verify that each of these two distinct characters appears exactly twice.
        // This is the secondary condition for the "double-pair" pattern.
        if (countForFirstChar === 2 && countForSecondChar === 2) {
            console.info('Affirmative'); // All conditions met, pattern confirmed.
        } else {
            console.warn('Negative'); // Counts do not align with the required pattern.
        }
    } else {
        // If the number of distinct characters is not exactly two (e.g., one, three, or more),
        // then the "double-pair" pattern is not present.
        console.warn('Negative');
    }
}

// The standard entry point for competitive programming environments in Node.js.
// It reads the entire content of standard input, decodes it as UTF-8,
// removes any leading/trailing whitespace, and then passes it to our processing function.
ProcessInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());