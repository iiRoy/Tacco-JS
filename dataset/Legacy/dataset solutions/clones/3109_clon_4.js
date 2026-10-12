const placeValue = (currentItems, itemValue) => {
    const insertionPoint = itemValue - 1;
    const leftSegment = currentItems.slice(0, insertionPoint);
    const rightSegment = currentItems.slice(insertionPoint);

    const extendedLeft = [...leftSegment];
    while (extendedLeft.length < insertionPoint) {
        extendedLeft.push(undefined);
    }

    return [...extendedLeft, itemValue, ...rightSegment];
};

const processInput = (rawInput) => {
    const inputLines = rawInput.split('\n');
    const numericSequence = inputLines[1].split(/\s+/).map(Number);

    const processingOutcome = numericSequence.reduce((accumulator, currentNumber, currentIndex) => {
        if (accumulator.hasErrorIndicator) {
            return accumulator;
        }

        const permissibleUpperLimit = currentIndex + 1;

        if (currentNumber > permissibleUpperLimit) {
            return { ...accumulator, hasErrorIndicator: true };
        }

        const updatedCollection = placeValue(accumulator.resultCollection, currentNumber);
        return { resultCollection: updatedCollection, hasErrorIndicator: false };
    }, { resultCollection: [], hasErrorIndicator: false });

    if (processingOutcome.hasErrorIndicator) {
        console.log(-1);
    } else {
        processingOutcome.resultCollection.forEach(item => console.log(item));
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
