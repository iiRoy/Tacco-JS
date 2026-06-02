const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
let dataPointer = { value: 0 }; // Encapsulate pointer in an object for pass-by-reference

// Helper function to retrieve the next line from the input array and advance the pointer
const fetchNextInputLine = (inputArray, pointerObject) => {
    return inputArray[pointerObject.value++];
};

// Helper function to apply the specific name transformation logic
const transformNameSegment = (originalNameString) => {
    let transformedSegment = "";
    let shouldAppendNextChar = true; // Flag to indicate if the next character should be appended
    for (let charToExamine of originalNameString) {
        if (shouldAppendNextChar) {
            transformedSegment += charToExamine;
            shouldAppendNextChar = false;
        }
        // If the current character is a vowel, the flag is reset for the next character
        if (/[aiueo]/.test(charToExamine)) {
            shouldAppendNextChar = true;
        }
    }
    return transformedSegment;
};

// Helper function to calculate the common prefix length between two strings,
// replicating the original's specific behavior regarding the 'totalSetSize' loop bound.
const calculateCommonPrefixLength = (stringA, stringB, totalSetSize) => {
    // The loop iterates up to 'totalSetSize' (original 'n'), which might be larger
    // than the strings' actual lengths. This behavior is preserved.
    for (let charPosition = 0; charPosition < totalSetSize; charPosition++) {
        // This comparison correctly handles cases where one or both characters are `undefined`
        // due to string length differences. `undefined !== undefined` evaluates to `false`.
        if (stringA[charPosition] !== stringB[charPosition]) {
            return charPosition; // Returns the index of the first differing character
        }
    }
    // If the loop completes without finding a difference:
    if (stringA.length === stringB.length) {
        return -1; // Indicates that both strings are identical
    }
    // If lengths differ but no difference was found within the loop (up to totalSetSize),
    // it means they matched up to the shorter string's length.
    // The original code returns `l` (Math.min(s1.length, s2.length)) in this scenario.
    return Math.min(stringA.length, stringB.length);
};


while (true) {
    let currentSetSize = +fetchNextInputLine(rawInputData, dataPointer);

    // Break condition for the main loop
    if (currentSetSize === 0) {
        break;
    }

    let rawNamesList = [];
    for (let nameIdx = 0; nameIdx < currentSetSize; nameIdx++) {
        rawNamesList.push(fetchNextInputLine(rawInputData, dataPointer));
    }

    // Apply the transformation and sort the resulting strings
    let processedStringList = rawNamesList.map(transformNameSegment).sort();

    let maximumPrefixLength = 0;
    // Iterate through the sorted list, comparing adjacent elements.
    // The loop starts from the second element (index 1) to compare with the previous one.
    for (let nameIndex = 1; nameIndex < currentSetSize; nameIndex++) {
        const previousProcessedName = processedStringList[nameIndex - 1];
        const currentProcessedName = processedStringList[nameIndex];

        // Calculate the common prefix length using the helper function
        let comparisonResult = calculateCommonPrefixLength(previousProcessedName, currentProcessedName, currentSetSize);

        // Special handling for identical consecutive strings: set to -2 and break
        if (comparisonResult === -1) {
            maximumPrefixLength = -2;
            break;
        }

        // Update the maximum prefix length found so far
        if (comparisonResult > maximumPrefixLength) {
            maximumPrefixLength = comparisonResult;
        }
    }
    // Output the final result, adding 1 as per original logic
    console.log(maximumPrefixLength + 1);
}
