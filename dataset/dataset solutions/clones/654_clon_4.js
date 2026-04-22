const maxNumericalBoundary = 2147483647;
const minNumericalBoundary = -2147483648;

class BoundsViolation extends Error {
    constructor(msg) { super(msg); this.name = "RangeError"; }
}
class IndexViolation extends Error {
    constructor(msg) { super(msg); this.name = "IndexError"; }
}
class NumericalOverflow extends Error {
    constructor(msg) { super(msg); this.name = "OverflowError"; }
}
class InputMisformat extends Error {
    constructor(msg) { super(msg); this.name = "ValueError"; }
}
class AssertionFailure extends Error {
    constructor(msg) { super(msg); this.name = "AssertionError"; }
}

function verifyIntegerRange(val) {
    if (val > maxNumericalBoundary || val < minNumericalBoundary) {
        throw new NumericalOverflow("over- or underflow");
    }
    return val;
}

function calculateSum(valA, valB) {
    const result = valA + valB;
    return verifyIntegerRange(result);
}

function calculateDifference(valA, valB) {
    const result = valA - valB;
    return verifyIntegerRange(result);
}

function calculateProduct(valA, valB) {
    const result = valA * valB;
    return verifyIntegerRange(result);
}

function checkSequenceBounds(idx, sequenceLength) {
    if (idx < 0 || idx >= sequenceLength) {
        throw new IndexViolation("index out of bounds");
    }
    return idx;
}

function checkQuantityRange(val, lowerLimit, upperLimit) {
    if (val < lowerLimit || val > upperLimit) {
        throw new BoundsViolation("value out of range");
    }
    return val;
}

function parseNumericalString(textEntry) {
    let currentPosition = 0;
    let initialSign = 1;
    let accumulatedDigits = 0; 

    if (textEntry[currentPosition] === '+') {
        currentPosition++;
    } else if (textEntry[currentPosition] === '-') {
        initialSign = -1;
        currentPosition++;
    }

    let parsedDigitCount = 0;
    
    if (currentPosition >= textEntry.length || !('0' <= textEntry[currentPosition] && textEntry[currentPosition] <= '9')) {
        throw new InputMisformat("invalid integer: " + textEntry);
    }

    while (currentPosition < textEntry.length) {
        const charCode = textEntry.charCodeAt(currentPosition);
        if (charCode >= 48 && charCode <= 57) { // '0' to '9'
            const digitValue = charCode - 48;
            accumulatedDigits = calculateDifference(calculateProduct(accumulatedDigits, 10), digitValue);
            parsedDigitCount++;
            currentPosition++;
        } else if (charCode === 95) { // '_'
            currentPosition++;
        } else {
            break;
        }
    }

    if (parsedDigitCount === 0) {
        throw new InputMisformat("invalid integer: " + textEntry);
    }

    const finalResult = (initialSign === 1) ? calculateProduct(accumulatedDigits, -1) : accumulatedDigits;

    if (currentPosition !== textEntry.length) {
        throw new InputMisformat("invalid integer: " + textEntry);
    }

    return finalResult;
}

async function processDataEntries() {
    const collectedEntries = [];
    const interactionSystem = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    interactionSystem.on('line', (dataLine) => {
        collectedEntries.push(dataLine);
    });

    await new Promise(completionSignal => interactionSystem.on('close', completionSignal));

    collectedEntries.forEach((entryLine) => {
        try {
            const componentStrings = entryLine.split(/\s+/).filter(Boolean);

            const numericComponents = componentStrings.map(parseNumericalString);

            if (numericComponents.length < 2) {
                checkSequenceBounds(0, numericComponents.length); 
                checkSequenceBounds(1, numericComponents.length); 
            }

            const firstComponent = numericComponents[checkSequenceBounds(0, numericComponents.length)];
            const secondComponent = numericComponents[checkSequenceBounds(1, numericComponents.length)];

            const finalSum = calculateSum(firstComponent, secondComponent);

            console.log(String(finalSum));
        } catch (problem) {
            const problemDescription = [];
            if (problem.message && problem.message.length > 0) {
                problemDescription.push("Error: unhandled exception: ");
                problemDescription.push(problem.message);
            } else {
                problemDescription.push("Error: unhandled exception");
            }
            problemDescription.push(" [");
            problemDescription.push(problem.name);
            problemDescription.push("]\n");

            throw new Error(problemDescription.join(''));
        }
    });
}

processDataEntries();