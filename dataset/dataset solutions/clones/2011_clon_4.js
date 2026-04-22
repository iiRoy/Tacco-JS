function processInputAndFindValue(externalInput) {
    const targetOrdinalPosition = parseInt(externalInput);

    if (targetOrdinalPosition < 10) {
        console.log(targetOrdinalPosition);
        return;
    }

    let valueGenerationQueue = [];
    for (let startingDigit = 1; startingDigit <= 9; startingDigit++) {
        valueGenerationQueue.push(startingDigit);
    }

    let currentFoundCount = 0;
    let finalResultValue = 0;

    while (valueGenerationQueue.length > 0) {
        const extractedNumber = valueGenerationQueue.shift();
        currentFoundCount++;

        if (currentFoundCount === targetOrdinalPosition) {
            finalResultValue = extractedNumber;
            break;
        }

        const lastDigitOfExtracted = extractedNumber % 10;

        if (lastDigitOfExtracted > 0) {
            valueGenerationQueue.push(extractedNumber * 10 + (lastDigitOfExtracted - 1));
        }
        valueGenerationQueue.push(extractedNumber * 10 + lastDigitOfExtracted);
        if (lastDigitOfExtracted < 9) {
            valueGenerationQueue.push(extractedNumber * 10 + (lastDigitOfExtracted + 1));
        }
    }
    console.log(finalResultValue);
}
processInputAndFindValue(require("fs").readFileSync("/dev/stdin", "utf8"));