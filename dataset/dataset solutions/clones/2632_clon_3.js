function findGreatestCommonDivisor(valueA, valueB) {
    let currentA = valueA;
    let currentB = valueB;
    let temporarySwapVariable;

    while (currentB !== 0) {
        temporarySwapVariable = currentB;
        currentB = currentA % currentB;
        currentA = temporarySwapVariable;
    }
    return currentA;
}

function calculateLeastCommonMultiple(operandOne, operandTwo) {
    const num1 = Number(operandOne);
    const num2 = Number(operandTwo);

    if (num1 === 0 || num2 === 0) {
        return 0;
    }

    const commonDivisor = findGreatestCommonDivisor(num1, num2);

    return (num1 * num2) / commonDivisor;
}

function processInputData(rawInputString) {
    console.log("main");

    let inputLines = rawInputString.split("\n");

    let elementCount = Number(inputLines[0]);

    let numericStringArray = inputLines[1].split(" ");

    const fixedInitialDenominator = Number(numericStringArray[0]);

    let currentSumNumerator = 1;

    console.log("for");

    for (let loopIterationIndex = 1; loopIterationIndex < elementCount; loopIterationIndex++) {
        console.log(loopIterationIndex);

        let currentElementNumericValue = Number(numericStringArray[loopIterationIndex]);

        let commonMultipleForCurrentTerm = calculateLeastCommonMultiple(fixedInitialDenominator, currentElementNumericValue);

        let scaledCurrentNumeratorPart = currentSumNumerator * (commonMultipleForCurrentTerm / fixedInitialDenominator);
        let newTermNumeratorContribution = commonMultipleForCurrentTerm / currentElementNumericValue;

        currentSumNumerator = scaledCurrentNumeratorPart + newTermNumeratorContribution;
    }

    console.log(fixedInitialDenominator / currentSumNumerator);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
