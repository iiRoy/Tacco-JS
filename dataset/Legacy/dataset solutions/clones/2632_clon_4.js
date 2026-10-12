function computeGreatestCommonDivisor(firstOperand, secondOperand) {
    if (secondOperand === 0) {
        return firstOperand;
    }
    return computeGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
}

function determineLeastCommonMultiple(valueA, valueB) {
    if (valueA === 0 || valueB === 0) {
        return 0;
    }
    return (valueA * valueB) / computeGreatestCommonDivisor(valueA, valueB);
}

function processInputData(inputPayload) {
    console.log("main");

    const inputLines = inputPayload.split("\n");
    const elementCount = Number(inputLines[0]);
    const numericElements = inputLines[1].split(" ").map(Number);

    console.log("for");

    const initialAccumulatorState = {
        currentLCM: numericElements[0],
        currentSumProduct: 1
    };

    const finalCalculationState = numericElements.slice(1).reduce((accumulator, currentElementValue, iterationIndex) => {
        const originalLoopIndex = iterationIndex + 1;
        console.log(originalLoopIndex);

        const nextLCM = determineLeastCommonMultiple(accumulator.currentLCM, currentElementValue);

        const updatedSumProduct = accumulator.currentSumProduct * (nextLCM / accumulator.currentLCM) + (nextLCM / currentElementValue);

        return {
            currentLCM: nextLCM,
            currentSumProduct: updatedSumProduct
        };
    }, initialAccumulatorState);

    console.log(finalCalculationState.currentLCM / finalCalculationState.currentSumProduct);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
