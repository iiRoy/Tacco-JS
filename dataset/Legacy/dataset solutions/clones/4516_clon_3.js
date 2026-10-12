const MODULO_VALUE = 1000000007;

function parseCounts(inputString) {
    const lines = inputString.split("\n");
    const numberStrings = lines[0].split(" ");
    const countA = parseInt(numberStrings[0], 10);
    const countB = parseInt(numberStrings[1], 10);
    return { countA, countB };
}

const computeModularFactorial = function(currentNum) {
    if (currentNum <= 0) {
        return 1;
    }
    const termOne = currentNum % MODULO_VALUE;
    const termTwo = computeModularFactorial(currentNum - 1) % MODULO_VALUE;
    return (termOne * termTwo) % MODULO_VALUE;
};

function processInputData(rawInputString) {
    const { countA: firstValue, countB: secondValue } = parseCounts(rawInputString);

    const differenceMagnitude = Math.abs(firstValue - secondValue);

    let calculatedOutput;

    switch (differenceMagnitude) {
        case 0:
            const factorialFirstEqual = computeModularFactorial(firstValue);
            const factorialSecondEqual = computeModularFactorial(secondValue);
            const productEqual = (factorialFirstEqual * factorialSecondEqual) % MODULO_VALUE;
            calculatedOutput = (productEqual * 2) % MODULO_VALUE;
            break;
        case 1:
            const factorialFirstDiff = computeModularFactorial(firstValue);
            const factorialSecondDiff = computeModularFactorial(secondValue);
            calculatedOutput = (factorialFirstDiff * factorialSecondDiff) % MODULO_VALUE;
            break;
        default: // differenceMagnitude >= 2
            calculatedOutput = 0;
            break;
    }

    console.log(calculatedOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
