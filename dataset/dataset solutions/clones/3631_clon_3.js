const processInput = require('readline');

let receivedLines = [];
let totalMatchingPairs = 0;

const ioManager = processInput.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

/**
 * Utility function to parse a specific numeric token from a space-delimited string.
 * It includes basic validation for robustness.
 * @param {string} sourceString The string from which to extract a number.
 * @param {number} segmentPosition The 0-based index of the number to retrieve.
 * @returns {number} The parsed integer, or NaN if parsing fails or input is invalid.
 */
function extractNumericSegment(sourceString, segmentPosition) {
    if (typeof sourceString !== 'string' || !sourceString.trim()) {
        console.warn("Input parsing warning: Source string is empty or not a string.");
        return NaN;
    }
    const stringTokens = sourceString.split(/\s+/);
    if (segmentPosition < 0 || segmentPosition >= stringTokens.length) {
        console.warn(`Input parsing warning: Segment position ${segmentPosition} out of bounds for "${sourceString}".`);
        return NaN;
    }
    const numericalValue = parseInt(stringTokens[segmentPosition], 10);
    if (isNaN(numericalValue)) {
        console.warn(`Input parsing warning: Could not convert "${stringTokens[segmentPosition]}" to a number.`);
    }
    return numericalValue;
}

ioManager.on('line', (currentInputLine) => {
    receivedLines.push(currentInputLine.trim());
});

ioManager.on('close', () => {
    // Validate that required input lines are present.
    if (receivedLines.length < 2) {
        console.error("Execution aborted: Not enough input lines. Expected at least two.");
        return;
    }

    // Process the first input line to get array dimensions and modulus.
    const configurationLine = receivedLines[0];
    const arraySize = extractNumericSegment(configurationLine, 0);
    const modulusBase = extractNumericSegment(configurationLine, 1);

    // Perform critical validation on extracted parameters.
    if (isNaN(arraySize) || isNaN(modulusBase) || arraySize <= 0 || modulusBase <= 0) {
        console.error(`Execution aborted: Invalid array size (${arraySize}) or modulus base (${modulusBase}). Both must be positive integers.`);
        return;
    }

    // Parse the second line into an array of numbers.
    const rawNumberSequence = receivedLines[1].split(/\s+/).map(token => parseInt(token, 10));

    // Validate the length of the parsed sequence against the expected array size.
    if (rawNumberSequence.length !== arraySize) {
        console.error(`Execution aborted: Mismatch in array length. Expected ${arraySize}, but received ${rawNumberSequence.length}.`);
        return;
    }

    // Calculate prefix sums modulo the given modulusBase.
    // prefixRemainders[k] will store (A[0] + ... + A[k-1]) % modulusBase.
    // Conventionally, prefixRemainders[0] is 0.
    const prefixRemainders = [];
    prefixRemainders.push(0); // Initialize S[0] = 0

    let accumulatedModuloSum = 0;
    for (let dataIndex = 0; dataIndex < arraySize; dataIndex++) {
        const currentDataElement = rawNumberSequence[dataIndex];
        if (isNaN(currentDataElement)) {
            console.error(`Execution aborted: Non-numeric element encountered at index ${dataIndex}.`);
            return;
        }
        accumulatedModuloSum = (accumulatedModuloSum + currentDataElement) % modulusBase;
        // Adjust for potential negative results from JavaScript's % operator if currentDataElement was negative.
        // For this problem, elements are usually positive, but this adds robustness.
        if (accumulatedModuloSum < 0) {
            accumulatedModuloSum += modulusBase;
        }
        prefixRemainders.push(accumulatedModuloSum);
    }

    // Utilize a Map to store the frequency of each remainder value encountered.
    // This allows for efficient counting of pairs (i, j) where S[j] == S[i].
    const remainderOccurrenceMap = new Map();
    // Initialize the map with the count for S[0] = 0.
    remainderOccurrenceMap.set(0, 1);

    // Iterate through the calculated prefix sums, starting from S[1].
    // For each prefix sum S[k], if we have previously seen S[k] 'X' times,
    // then there are 'X' new subarrays ending at k whose sum is divisible by modulusBase.
    for (let k = 1; k < prefixRemainders.length; k++) {
        const currentRemainder = prefixRemainders[k];
        // Retrieve the number of times this remainder has appeared before, defaulting to 0.
        const priorOccurrences = remainderOccurrenceMap.get(currentRemainder) || 0;
        
        // Add these prior occurrences to our total count of matching pairs.
        totalMatchingPairs += priorOccurrences;
        
        // Increment the count for the current remainder in the map.
        remainderOccurrenceMap.set(currentRemainder, priorOccurrences + 1);
    }

    // Output the final computed count.
    console.log(totalMatchingPairs);
});