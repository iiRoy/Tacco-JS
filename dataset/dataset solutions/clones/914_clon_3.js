const fileSystemModule = require("fs"); // Renamed 'fs' to 'fileSystemModule' for clarity
let rawBufferContents = fileSystemModule.readFileSync("/dev/stdin", "utf8"); // Changed variable name from 'input'
let allInputLinesArray = rawBufferContents.split("\n"); // Renamed array of lines
let lineReadingCursor = 0; // Renamed index variable from 'index'

// Helper function to read the next line from the input array and advance the cursor
const fetchNextLine = () => {
    // Adding a basic check for end of input, a Type III addition for robustness
    if (lineReadingCursor >= allInputLinesArray.length) {
        return null; // Signal that no more lines are available
    }
    return allInputLinesArray[lineReadingCursor++];
};

// Define a set of vowels for efficient lookup, replacing regex for performance/style
const ENGLISH_VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

// Helper function to determine if a character is a vowel, a Type III addition
const isCharacterAVowel = (charToCheck) => {
    // Ensure the character is treated as lowercase for case-insensitive vowel check
    return typeof charToCheck === 'string' && charToCheck.length === 1 && ENGLISH_VOWELS.has(charToCheck.toLowerCase());
};

// Constant for the termination signal, a Type III addition for readability
const TERMINATION_VALUE = 0;
// Constant for the special result state when identical strings are found, a Type III addition
const IDENTICAL_STRINGS_FOUND_CODE = -2;

// Main processing unit for a single data set (formerly _loop_1)
const handleOneInputDataSet = () => {
    // Read the number of entries for the current data set
    let entriesCountString = fetchNextLine();
    // Guard clause: If no more input, signal to stop the main loop
    if (entriesCountString === null) {
        return false;
    }

    const currentDataSetSize = parseInt(entriesCountString, 10); // Explicit radix for parseInt

    // Guard clause: If the size is the termination value, stop processing
    if (currentDataSetSize === TERMINATION_VALUE) {
        return false; // Signal to terminate the entire program
    }

    // Array to store the original names for this data set
    let originalNameList = [];
    // Populate the list by reading 'currentDataSetSize' number of lines
    for (let currentNameIndex = 0; currentNameIndex < currentDataSetSize; currentNameIndex++) {
        let rawNameEntry = fetchNextLine();
        // Another guard clause for unexpected end of file
        if (rawNameEntry === null) {
            originalNameList.push(""); // Add an empty string to avoid errors if input is malformed
            continue;
        }
        originalNameList.push(rawNameEntry);
    }

    // Transform each original name into its abbreviated form
    // The rule: take the first character, then any character immediately following a vowel.
    let abbreviatedNameForms = originalNameList.map((sourceName) => {
        let generatedAbbreviation = ""; // Accumulator for the result
        let captureNextCharacter = true; // Flag to indicate if the next character should be added

        // Iterate through each character of the source name using a traditional for loop
        for (let charPos = 0; charPos < sourceName.length; charPos++) {
            let currentCharacter = sourceName[charPos];

            // If the flag is set, append the current character to the abbreviation
            if (captureNextCharacter) {
                generatedAbbreviation += currentCharacter;
                captureNextCharacter = false; // Reset the flag
            }

            // If the current character is a vowel, set the flag for the next character
            if (isCharacterAVowel(currentCharacter)) {
                captureNextCharacter = true;
            }
        }
        return generatedAbbreviation;
    });

    // Sort the abbreviated names alphabetically
    abbreviatedNameForms.sort();

    // Helper function to compute the length of the common prefix between two strings
    const determineCommonPrefixLength = (stringOne, stringTwo) => {
        const shorterStringLength = Math.min(stringOne.length, stringTwo.length);
        // Compare characters one by one until a mismatch is found or end of shorter string
        for (let comparisonPoint = 0; comparisonPoint < shorterStringLength; comparisonPoint++) {
            if (stringOne[comparisonPoint] !== stringTwo[comparisonPoint]) {
                return comparisonPoint; // Return the length of the common prefix
            }
        }
        return shorterStringLength; // If one is a prefix of another or they are identical
    };

    let maximumPrefixFound = 0; // Initialize the maximum common prefix length
    let finalOutputValue = maximumPrefixFound; // Variable to hold the result or special code

    // Iterate through the sorted list to find the longest common prefix between adjacent elements
    // The loop starts from the second element (index 1) to compare with its predecessor.
    for (let currentComparisonIdx = 1; currentComparisonIdx < currentDataSetSize; currentComparisonIdx++) {
        let previousString = abbreviatedNameForms[currentComparisonIdx - 1];
        let currentString = abbreviatedNameForms[currentComparisonIdx];

        // Calculate the common prefix length for the current pair
        let commonPrefixForPair = determineCommonPrefixLength(previousString, currentString);

        // Check if the two adjacent strings are completely identical (original code's 'c == -1' case)
        if (commonPrefixForPair === previousString.length && commonPrefixForPair === currentString.length) {
            finalOutputValue = IDENTICAL_STRINGS_FOUND_CODE; // Set special code for identical strings
            break; // No need to check further, identical strings take precedence
        }

        // Update the maximum prefix found if the current pair has a longer common prefix
        if (commonPrefixForPair > finalOutputValue) {
            finalOutputValue = commonPrefixForPair;
        }
    }

    // Output the final result, adding 1 as per original problem specification
    console.log(finalOutputValue + 1);

    return true; // Signal to continue processing the next data set
};

// Main execution loop: continuously process data sets until a termination signal is received
while (handleOneInputDataSet()) {
    // The loop continues as long as 'handleOneInputDataSet' returns true.
    // It stops when 'handleOneInputDataSet' returns false (due to '0' input or EOF).
}