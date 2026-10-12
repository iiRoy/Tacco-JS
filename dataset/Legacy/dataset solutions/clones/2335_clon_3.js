function processInput(rawInput) {
    const DECREMENT_STEP = 2;
    let currentNumber = parseInt(rawInput, 10);
    let totalZeroCount = 0;

    for (let i = currentNumber; i > 0; i -= DECREMENT_STEP) {
        totalZeroCount += countTrailingZeros(i);
    }
    console.log(totalZeroCount);
}

function countTrailingZeros(numericValue) {
    let zeroCounter = 0;
    const stringRepresentation = numericValue.toString();
    let charIndex = stringRepresentation.length - 1;

    for (; charIndex >= 0; charIndex--) {
        if (stringRepresentation[charIndex] === "0") {
            zeroCounter++;
        } else {
            break;
        }
    }
    return zeroCounter;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
