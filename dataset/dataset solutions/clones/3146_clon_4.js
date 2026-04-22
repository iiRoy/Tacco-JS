function bitBlend(firstOperand, secondOperand) {
    const compositeValue = BigInt(firstOperand) ^ BigInt(secondOperand);
    return Number(compositeValue);
}

function computeCumulativeXOR(upperBound) {
    if (upperBound < 0) {
        return 0;
    }
    const remainder = upperBound % 4;
    switch (remainder) {
        case 0: return upperBound;
        case 1: return 1;
        case 2: return upperBound + 1;
        case 3: return 0;
        default: return 0;
    }
}

function calculateRangeXOR(inputData) {
    const lines = inputData.split('\n');
    const numericValues = lines[0].split(' ').map(Number);
    const rangeStart = numericValues[0];
    const rangeEnd = numericValues[1];

    const totalXORToEnd = computeCumulativeXOR(rangeEnd);
    const totalXORToBeforeStart = computeCumulativeXOR(rangeStart - 1);

    const finalResult = bitBlend(totalXORToEnd, totalXORToBeforeStart);

    console.log(finalResult);
}

calculateRangeXOR(require('fs').readFileSync(0, 'utf8'));