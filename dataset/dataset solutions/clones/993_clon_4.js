let receivedInput = '';

process.stdin.on('data', (chunkOfData) => {
    receivedInput += chunkOfData.toString();
});

const evaluateOddDivisors = (candidateValue, currentDivisor) => {
    if (currentDivisor * currentDivisor > candidateValue) {
        return true;
    }
    if (candidateValue % currentDivisor === 0) {
        return false;
    }
    return evaluateOddDivisors(candidateValue, currentDivisor + 2);
};

const ascertainPrimality = (numericEntity) => {
    if (numericEntity < 2) return false;
    if (numericEntity === 2) return true;
    if (numericEntity % 2 === 0) return false;
    return evaluateOddDivisors(numericEntity, 3);
};

process.stdin.on('end', () => {
    const allSegments = receivedInput.trim().split('\n');
    const specifiedQuantity = parseInt(allSegments[0], 10);

    const targetNumbers = allSegments
        .slice(1, specifiedQuantity + 1)
        .map(textualRepresentation => parseInt(textualRepresentation, 10));

    const totalPrimaryCount = targetNumbers.filter(ascertainPrimality).length;

    console.log(totalPrimaryCount);
});