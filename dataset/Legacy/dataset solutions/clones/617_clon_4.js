const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawData.trim().split("\n");

const initialNumericValue = Number(lineSegments[0]);

const operationHandlers = {
    "+": (currentAccumulator, operandValue) => currentAccumulator + operandValue,
    "-": (currentAccumulator, operandValue) => currentAccumulator - operandValue,
    "*": (currentAccumulator, operandValue) => currentAccumulator * operandValue,
    "/": (currentAccumulator, operandValue) => currentAccumulator / operandValue,
};

function processCalculations(currentAccumulator, segmentIndex, segmentsArray, handlersMap) {
    if (segmentIndex >= segmentsArray.length || segmentsArray[segmentIndex] === "=") {
        return Math.trunc(currentAccumulator);
    }

    const currentOperatorSymbol = segmentsArray[segmentIndex];
    const nextOperandValue = Number(segmentsArray[segmentIndex + 1]);

    const performOperation = handlersMap[currentOperatorSymbol];

    const intermediateResult = performOperation(currentAccumulator, nextOperandValue);

    const truncatedIntermediate = Math.trunc(intermediateResult);

    return processCalculations(truncatedIntermediate, segmentIndex + 2, segmentsArray, handlersMap);
}

const finalComputedValue = processCalculations(initialNumericValue, 1, lineSegments, operationHandlers);

console.log(finalComputedValue);
