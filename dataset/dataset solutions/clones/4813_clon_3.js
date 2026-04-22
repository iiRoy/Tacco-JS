const logResult = (messageContent) => {
    console.log(String(messageContent));
};

const processSequenceAnalysis = (rawInputData) => {
    const MODULO_CONSTANT = 1000000007;

    const cleanedInputLines = rawInputData.trim().split('\n');

    let sequenceLength = parseInt(cleanedInputLines[0], 10);
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        logResult("0");
        return;
    }

    const numericElements = cleanedInputLines[1].split(' ').map(Number);
    if (numericElements.some(isNaN) || numericElements.length !== sequenceLength) {
        logResult("0");
        return;
    }

    // This object tracks occurrences, but specifically caps at 2.
    // If an element appears once, its value is 1. If it appears twice or more, its value is 2.
    const elementOccurrenceMap = {};
    for (let currentElementIndex = 0; currentElementIndex < sequenceLength; currentElementIndex++) {
        const currentElementValue = numericElements[currentElementIndex];
        if (elementOccurrenceMap[currentElementValue] === undefined) {
            elementOccurrenceMap[currentElementValue] = 1;
        } else if (elementOccurrenceMap[currentElementValue] === 1) {
            elementOccurrenceMap[currentElementValue] = 2;
        }
    }

    // Obtain unique elements, then sort them in ascending order.
    let uniqueSortedValues = Array.from(new Set(numericElements)).sort((valA, valB) => valA - valB);

    let finalCalculatedResult = 1;
    const isLengthOdd = (sequenceLength % 2 !== 0);

    for (let currentUniqueIdx = 0; currentUniqueIdx < uniqueSortedValues.length; currentUniqueIdx++) {
        const valueToCheck = uniqueSortedValues[currentUniqueIdx];
        const actualOccurrences = elementOccurrenceMap[valueToCheck];

        if (isLengthOdd && valueToCheck === 0) {
            // If the total sequence length is odd, the value '0' has a special rule:
            // It must appear exactly once.
            if (actualOccurrences !== 1) {
                logResult("0");
                return;
            }
            // If '0' is valid, we continue to the next unique element.
            continue;
        }

        // For all other elements (or all elements if total length is even):
        // Each element must appear exactly twice.
        if (actualOccurrences !== 2) {
            logResult("0");
            return;
        }
    }

    // After all validations, if the sequence length was odd,
    // we need to remove '0' from the unique sorted values list for the final computation.
    if (isLengthOdd) {
        const zeroElementPosition = uniqueSortedValues.indexOf(0);
        if (zeroElementPosition !== -1) {
            uniqueSortedValues.splice(zeroElementPosition, 1);
        } else {
            // This scenario implies a logical inconsistency if execution reaches here,
            // as '0' should have been caught by earlier validation if not present
            // or not appearing exactly once when length is odd.
            // However, the original code's behavior for `list.shift()` would do nothing
            // if `0` was not at the start, thus preserving original logic.
            // The earlier checks ensure correctness.
        }
    }

    // Calculate 2 raised to the power of the count of remaining unique elements,
    // with each step applying the modulo.
    for (let i = 0; i < uniqueSortedValues.length; i++) {
        finalCalculatedResult = (finalCalculatedResult * 2) % MODULO_CONSTANT;
    }

    logResult(finalCalculatedResult);
};

// Entry point: reads input from standard input and invokes the main processing logic.
processSequenceAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));