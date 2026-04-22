const fileSystemInterface = require('fs');
const rawTextualData = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');
const parsedTextLines = rawTextualData.split('\n');
let currentTextPointer = 0;

const acquireNextLine = () => parsedTextLines[currentTextPointer++];

const executeComputation = () => {
    const totalCount = Number(acquireNextLine());
    const numericSequence = acquireNextLine().split(' ').map(Number);

    const countTracker = new Map();
    countTracker.set(0, 1);
    for (let currentKey = 1; currentKey < totalCount; ++currentKey) {
        countTracker.set(currentKey, 2);
    }

    for (const itemElement of numericSequence) {
        if (!countTracker.has(itemElement)) {
            console.log("0");
            return;
        }
        countTracker.set(itemElement, countTracker.get(itemElement) - 1);
    }

    let validationStatus = true;
    const startingParityCheck = (totalCount % 2 === 1) ? 0 : 1;

    for (let checkPosition = startingParityCheck; checkPosition < totalCount; checkPosition += 2) {
        if (countTracker.get(checkPosition) !== 0) {
            validationStatus = false;
            break;
        }
    }

    if (!validationStatus) {
        console.log("0");
        return;
    }

    const powerBase = 2;
    const exponentValue = Math.floor(totalCount / 2);
    const finalOutcome = Math.pow(powerBase, exponentValue);

    console.log(finalOutcome.toString());
};

executeComputation();