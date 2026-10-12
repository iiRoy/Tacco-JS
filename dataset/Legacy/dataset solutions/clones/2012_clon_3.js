function processInput(rawData) {
    const targetCount = parseInt(rawData);
    const initialDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let processingQueue = [...initialDigits];

    let finalValue;

    for (let iterationIndex = 0; iterationIndex < targetCount; iterationIndex++) {
        const currentValue = processingQueue.shift();

        const lastDigit = currentValue % 10;
        const baseForNext = currentValue * 10;

        if (lastDigit !== 0) {
            processingQueue.push(baseForNext + lastDigit - 1);
        }

        processingQueue.push(baseForNext + lastDigit);

        if (lastDigit !== 9) {
            processingQueue.push(baseForNext + lastDigit + 1);
        }
        finalValue = currentValue;
    }
    console.log(finalValue);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
