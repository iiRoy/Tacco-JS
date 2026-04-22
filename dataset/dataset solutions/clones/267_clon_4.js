let emitResult = console.log;
let getSquareRoot = Math.sqrt;

function processNumericalSequence(dataStream) {
    const rawSegments = dataStream.match(/-?\d+(\.\d+)?/g) || [];
    const numericElements = rawSegments.map(parseFloat);

    function handlePairRecursively(currentBatch) {
        if (currentBatch.length === 0) {
            return;
        }

        const operandA = currentBatch[0];
        const operandB = currentBatch[1];

        if (operandA * operandB === 0) {
            return;
        }

        const squareOfFirstOperand = operandA * operandA;
        const radicand = 4 * operandB * operandB + squareOfFirstOperand;
        const calculatedOutcome = operandA * getSquareRoot(radicand) + squareOfFirstOperand;

        emitResult(calculatedOutcome);

        handlePairRecursively(currentBatch.slice(2));
    }

    handlePairRecursively(numericElements);
}