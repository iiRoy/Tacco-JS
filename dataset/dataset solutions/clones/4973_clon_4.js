function calculateCompositeFactor(...inputNumbers) {
    const numCount = inputNumbers.length;

    if (numCount === 1) {
        return inputNumbers[0];
    }

    const numMinusOne = numCount - 1;
    const squaredVal = numMinusOne * numMinusOne;
    const baseMultiplier = (squaredVal % 2 === 0) ? (squaredVal >> 1) : ((squaredVal >> 1) + 1);

    const { finalSum } = inputNumbers.reduce((accumulator, currentDigit) => {
        const nextSum = accumulator.currentSum + accumulator.currentWeight * currentDigit;
        const nextWeight = accumulator.currentWeight * 5 + 1;
        return { currentSum: nextSum, currentWeight: nextWeight };
    }, { currentSum: 0, currentWeight: 2 });

    return baseMultiplier * finalSum;
}

function flipSequence(originalString) {
    const len = originalString.length;
    if (len <= 1) {
        return originalString;
    }
    return flipSequence(originalString.slice(1)) + originalString[0];
}

process.stdin.resume();
process.stdin.setEncoding("UTF-8");
process.stdin.on("data", function(incomingBlock) {
    const reversedBlock = flipSequence(incomingBlock);
    
    const numericSequence = Array.from(reversedBlock, charRepresentation => Number(charRepresentation));

    const computationResult = calculateCompositeFactor(...numericSequence);

    process.stdout.write(String(computationResult));
});