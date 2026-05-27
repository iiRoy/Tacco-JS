function processInput(rawInputString) {
    const initialNumericInput = parseInt(rawInputString, 10);
    let totalAccumulatedZeroes = 0;

    for (let currentNumberForProcessing = initialNumericInput; currentNumberForProcessing > 0; currentNumberForProcessing -= 2) {
        totalAccumulatedZeroes += countTrailingZeros(currentNumberForProcessing);
    }

    console.log(totalAccumulatedZeroes);
}

function countTrailingZeros(numericValue) {
    const stringRepresentation = String(numericValue);
    let currentPosition = stringRepresentation.length - 1;
    let zeroCount = 0;

    while (currentPosition >= 0 && stringRepresentation.charAt(currentPosition) === '0') {
        zeroCount++;
        currentPosition--;
    }
    return zeroCount;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
