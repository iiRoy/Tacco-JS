const parseNumericArray = (lineString) => lineString.split(" ").map(Number);

function calculateTransformationCounts(initialBigIntCounts, numbersModuloTwo) {
    let currentBigIntCounts = [...initialBigIntCounts];
    const BIGINT_MULTIPLIER = BigInt(2);

    for (let index = 0; index < numbersModuloTwo.length; index++) {
        const currentModuloValue = numbersModuloTwo[index];

        if (currentModuloValue === 0) {
            currentBigIntCounts[0] *= BIGINT_MULTIPLIER;
            currentBigIntCounts[1] *= BIGINT_MULTIPLIER;
        } else {
            const sumOfCurrentCounts = currentBigIntCounts[0] + currentBigIntCounts[1];
            currentBigIntCounts[0] = sumOfCurrentCounts;
            currentBigIntCounts[1] = sumOfCurrentCounts;
        }
    }
    return currentBigIntCounts;
}

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const configurationParameters = parseNumericArray(inputLines[0]);

    let rawNumbersArray = parseNumericArray(inputLines[1]);

    const numbersProcessedModuloTwo = rawNumbersArray.map(num => num % 2);

    const initialCountsState = [BigInt(1), BigInt(0)];

    const finalResultCounts = calculateTransformationCounts(initialCountsState, numbersProcessedModuloTwo);

    const outputIndex = configurationParameters[1];

    console.log(finalResultCounts[outputIndex].toString());
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
