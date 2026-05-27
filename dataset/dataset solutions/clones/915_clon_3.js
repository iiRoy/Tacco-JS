const fileSystem = require("fs");
const rawDataLines = fileSystem.readFileSync("/dev/stdin", "utf8").split("\n");

let currentLineIndex = 0;

// Helper function to read the next line from the input data
const fetchNextInputLine = () => rawDataLines[currentLineIndex++];

// Helper for efficient vowel checking
const VOWEL_CHARACTER_SET = new Set(['a', 'i', 'u', 'e', 'o']);

// Helper function to process each name according to the specified rule
const transformNameBasedOnVowels = (originalNameString) => {
    let processedNameResult = '';
    let shouldIncludeNextCharacter = true; // Corresponds to 'flg' in original

    for (const character of originalNameString) {
        if (shouldIncludeNextCharacter) {
            processedNameResult += character;
            shouldIncludeNextCharacter = false;
        }
        if (VOWEL_CHARACTER_SET.has(character)) {
            shouldIncludeNextCharacter = true;
        }
    }
    return processedNameResult;
};

// Helper function to determine the length of the common prefix between two strings
const computeCommonPrefixLength = (firstString, secondString) => {
    const shortestLength = Math.min(firstString.length, secondString.length);
    let commonCharactersCount = 0;

    for (let charPosition = 0; charPosition < shortestLength; charPosition++) {
        if (firstString[charPosition] !== secondString[charPosition]) {
            return charPosition; // Return the index of the first differing character
        }
        commonCharactersCount++;
    }

    // If both strings are identical in content and length
    if (firstString.length === secondString.length && commonCharactersCount === firstString.length) {
        return -1; // Special value indicating exact match
    }
    return commonCharactersCount; // Length of the common prefix
};

let numberOfEntriesInBlock;
do {
    numberOfEntriesInBlock = +fetchNextInputLine(); // Read 'n'
    if (numberOfEntriesInBlock === 0) {
        break; // Exit loop if 'n' is 0
    }

    const collectedOriginalNames = [];
    for (let entryIdx = 0; entryIdx < numberOfEntriesInBlock; entryIdx++) {
        collectedOriginalNames.push(fetchNextInputLine());
    }

    // Process names and sort them
    const processedAndSortedNameList = collectedOriginalNames
        .map(transformNameBasedOnVowels)
        .sort();

    let currentMaxPrefixLength = 0; // Corresponds to 'result' in original

    for (let entryIdx = 1; entryIdx < numberOfEntriesInBlock; entryIdx++) {
        const previousEntryName = processedAndSortedNameList[entryIdx - 1];
        const currentEntryName = processedAndSortedNameList[entryIdx];

        const calculatedPrefixMatch = computeCommonPrefixLength(previousEntryName, currentEntryName);

        if (calculatedPrefixMatch === -1) {
            currentMaxPrefixLength = -2; // Indicates an exact duplicate pair, matching original behavior
            break;
        }

        if (calculatedPrefixMatch > currentMaxPrefixLength) {
            currentMaxPrefixLength = calculatedPrefixMatch;
        }
    }
    console.log(currentMaxPrefixLength + 1);
} while (true);
