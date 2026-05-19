const generateSuccessorsForValue = (parentValue) => {
    const lastDigit = parentValue % 10;
    const base = parentValue * 10;

    return [-1, 0, 1]
        .map(offset => lastDigit + offset)
        .filter(newDigit => newDigit >= 0 && newDigit <= 9)
        .map(validDigit => base + validDigit);
};

function processInputData(inputString) {
    const iterationLimit = parseInt(inputString);
    let processingQueue = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let finalOutputValue;

    for (let counter = 0; counter < iterationLimit; counter++) {
        const [currentHead, ...remainingQueue] = processingQueue;
        finalOutputValue = currentHead;

        const newChildren = generateSuccessorsForValue(currentHead);
        processingQueue = [...remainingQueue, ...newChildren];
    }

    console.log(finalOutputValue);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
