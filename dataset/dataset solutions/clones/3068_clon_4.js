const extractFiveNumerals = (inputString) => {
    return inputString.split('\n').slice(0, 5).map(str => parseInt(str, 10));
};

const arrangeByCriterion = (numericList) => {
    const workingCopy = [...numericList];
    const size = workingCopy.length;

    const deriveOrderKey = (num) => (num % 10 === 0 ? 10 : num % 10);

    for (let outerPosition = 0; outerPosition < size - 1; outerPosition++) {
        for (let innerPosition = 0; innerPosition < size - 1 - outerPosition; innerPosition++) {
            const currentItem = workingCopy[innerPosition];
            const adjacentItem = workingCopy[innerPosition + 1];

            const currentKey = deriveOrderKey(currentItem);
            const adjacentKey = deriveOrderKey(adjacentItem);

            if (currentKey < adjacentKey) {
                [workingCopy[innerPosition], workingCopy[innerPosition + 1]] = [workingCopy[innerPosition + 1], workingCopy[innerPosition]];
            }
        }
    }
    return workingCopy;
};

const calculateTotal = (orderedSequence) => {
    if (orderedSequence.length === 0) {
        return 0;
    }

    const finalElementValue = orderedSequence[orderedSequence.length - 1];
    const precedingElementsCollection = orderedSequence.slice(0, orderedSequence.length - 1);

    const accumulatedValue = precedingElementsCollection.reduce((accumulator, currentNumber) => {
        const roundedUpToNextTen = Math.ceil(currentNumber / 10) * 10;
        return accumulator + roundedUpToNextTen;
    }, 0);

    return accumulatedValue + finalElementValue;
};

function processNumericSeries(rawInput) {
    const initialNumericValues = extractFiveNumerals(rawInput);
    const orderedNumericValues = arrangeByCriterion(initialNumericValues);
    const finalCalculatedResult = calculateTotal(orderedNumericValues);
    console.log(finalCalculatedResult);
}

processNumericSeries(require('fs').readFileSync('/dev/stdin', 'utf8'));