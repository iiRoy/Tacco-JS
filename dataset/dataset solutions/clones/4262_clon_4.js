function printOutcome(finalResult) {
    console.log(finalResult);
}

function calculateDigitSum(numericValue) {
    let sumOfDigits = 0;
    let processingNumber = Math.abs(numericValue);

    if (processingNumber === 0) {
        return 0;
    }

    while (processingNumber > 0) {
        sumOfDigits += processingNumber % 10;
        processingNumber = Math.floor(processingNumber / 10);
    }
    return sumOfDigits;
}

function processInputData(rawInputString) {
    const baseInteger = parseInt(rawInputString, 10);

    const rangeValues = Array.from({ length: 10 }, (_, index) => index + 1);

    const computedSums = rangeValues.map(currentFactor => {
        const productValue = baseInteger * currentFactor;
        return calculateDigitSum(productValue);
    });

    const lowestSum = Math.min(...computedSums);

    printOutcome(lowestSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
