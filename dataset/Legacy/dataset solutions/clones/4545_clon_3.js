function processInputData(rawData) {
    const MODULO_BASE = 10;

    let linesOfInput = rawData.split("\n");
    let firstLineComponents = linesOfInput[0].split(" ");
    let itemCount = parseInt(firstLineComponents[0]);

    let remainderGroups = initializeNestedArray(MODULO_BASE);

    let totalSum = 0;
    let smallestNonZeroRemainder = 1000; // Initialized to a value larger than any expected input

    for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
        let currentInputString = linesOfInput[currentIdx + 1];
        let parsedNumericValue = parseInt(currentInputString);

        totalSum += parsedNumericValue;

        let hasNonZeroRemainder = (parsedNumericValue % MODULO_BASE !== 0);
        if (parsedNumericValue < smallestNonZeroRemainder && hasNonZeroRemainder) {
            smallestNonZeroRemainder = parsedNumericValue;
        }

        let secondCharacter = currentInputString[1];
        for (let digitValue = 0; digitValue < MODULO_BASE; digitValue++) {
            // Preserve original behavior: compare character to number, relying on JS type coercion
            // For clarity, explicitly convert digitValue to string for comparison.
            if (secondCharacter == String(digitValue)) {
                remainderGroups[digitValue].push(parsedNumericValue);
            }
        }
    }

    if (totalSum % MODULO_BASE !== 0) {
        console.log(totalSum);
    } else {
        let allItemsHadSecondDigitZero = (remainderGroups[0].length === itemCount);
        if (allItemsHadSecondDigitZero) {
            console.log(0);
        } else {
            console.log(totalSum - smallestNonZeroRemainder);
        }
    }
}

// Helper function to initialize an array of empty arrays
function initializeNestedArray(size) {
    let newArray = new Array(size);
    for (let arrayIndex = 0; arrayIndex < size; arrayIndex++) {
        newArray[arrayIndex] = [];
    }
    return newArray;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
