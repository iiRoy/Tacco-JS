function measureMagnitude(numericalValue) {
    if (numericalValue === 0) return 1;
    return Math.floor(Math.log10(numericalValue)) + 1;
}

function calculateModularExponentiation(baseFigure, exponentPower, modulusDivider) {
    let outcome = 1;
    baseFigure %= modulusDivider;
    while (exponentPower > 0) {
        if (exponentPower % 2 === 1) outcome = (outcome * baseFigure) % modulusDivider;
        baseFigure = (baseFigure * baseFigure) % modulusDivider;
        exponentPower = Math.floor(exponentPower / 2);
    }
    return outcome;
}

function processArithmeticProgression(dataInput) {
    const [seriesLength, initialElement, commonDifference, modulusValue] = dataInput.split(' ').map(Number);

    const resultantRemainder = Array.from({ length: seriesLength }, (_, indexPosition) => initialElement + (commonDifference * indexPosition))
        .reduce((currentAccumulation, termValue) => {
            const digitsInCurrentTerm = measureMagnitude(termValue);
            const tenRaisedToDigitsMod = calculateModularExponentiation(10, digitsInCurrentTerm, modulusValue);
            return (currentAccumulation * tenRaisedToDigitsMod + (termValue % modulusValue)) % modulusValue;
        }, 0);

    console.log(resultantRemainder);
}

processArithmeticProgression(require("fs").readFileSync("/dev/stdin", "utf8"));