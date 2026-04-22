const displayResult = (finalOutput) => console.log(finalOutput);

const calculateSumOfDigits = (valueToProcess) => {
    let accumulator = 0;
    let mutableValue = valueToProcess;
    while (mutableValue > 0) {
        accumulator += mutableValue % 10;
        mutableValue = Math.floor(mutableValue / 10);
    }
    return accumulator;
};

const executeComputation = (rawInputText) => {
    const primaryNumber = Number(rawInputText);
    const iterationCeiling = 100000;

    const minimumDigitSum = Array.from({ length: iterationCeiling }, (_, iterationIndex) => iterationIndex + 1)
        .map(currentMultiplier => primaryNumber * currentMultiplier)
        .map(productValue => calculateSumOfDigits(productValue))
        .reduce((currentMin, digitSum) => Math.min(currentMin, digitSum), Number.MAX_SAFE_INTEGER);

    displayResult(minimumDigitSum);
};

const retrieveSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

executeComputation(retrieveSourceData());