const fileSystem = require('fs');

function extractValues(iterableInput, limitCount) {
    if (Array.isArray(iterableInput)) {
        return iterableInput;
    }

    let collectedElements = [];
    let iterationDone = false;
    let hasErrorOccurred = false;
    let caughtException = undefined;
    let valueIterator = undefined;

    try {
        if (iterableInput == null || typeof iterableInput[Symbol.iterator] !== 'function') {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
        valueIterator = iterableInput[Symbol.iterator]();
        let iteratorItem;

        while (!(iterationDone = (iteratorItem = valueIterator.next()).done)) {
            collectedElements.push(iteratorItem.value);
            if (limitCount && collectedElements.length === limitCount) {
                break;
            }
        }
    } catch (error) {
        hasErrorOccurred = true;
        caughtException = error;
    } finally {
        try {
            if (valueIterator && typeof valueIterator.return === 'function' && !iterationDone) {
                valueIterator.return();
            }
        } finally {
            if (hasErrorOccurred) {
                throw caughtException;
            }
        }
    }
    return collectedElements;
}

function evaluateConditionsAndPrint(initialValue, adjustmentOffset, targetValue) {
    let shouldOutputYes = false;

    const isInitialEqualToTarget = (initialValue === targetValue);
    const isOffsetZero = (adjustmentOffset === 0);

    if (isInitialEqualToTarget && isOffsetZero) {
        shouldOutputYes = true;
    } else if (initialValue < targetValue && initialValue + adjustmentOffset >= targetValue) {
        shouldOutputYes = true;
    }

    if (shouldOutputYes) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

const standardInputPath = "/dev/stdin";
const encodingFormat = "UTF-8";

const rawInputContent = fileSystem.readFileSync(standardInputPath, encodingFormat);
const inputLinesArray = rawInputContent.split("\n");

const firstLineOfInput = inputLinesArray[0];
const numericStringParts = firstLineOfInput.split(" ");
const parsedNumericValues = numericStringParts.map(numericString => Number(numericString));

const [initialValue, adjustmentOffset, targetValue] = extractValues(parsedNumericValues, 3);

evaluateConditionsAndPrint(initialValue, adjustmentOffset, targetValue);

module.exports = undefined;
