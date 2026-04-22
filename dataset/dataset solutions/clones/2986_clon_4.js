const determineFactors = (numericTarget) => {
    const factorRepository = new Set();
    let potentialDivisor = 1;
    while (potentialDivisor * potentialDivisor <= numericTarget) {
        if (numericTarget % potentialDivisor === 0) {
            factorRepository.add(potentialDivisor);
            factorRepository.add(numericTarget / potentialDivisor);
        }
        potentialDivisor++;
    }
    return Array.from(factorRepository);
};

const executeCalculation = (dataPayload) => {
    const parsedNumber = Number(dataPayload.trim());
    const allKnownFactors = determineFactors(parsedNumber);

    allKnownFactors.sort((valA, valB) => valA - valB);

    let finalAccumulation = 0;
    const elementsForSum = Math.floor(allKnownFactors.length / 2);

    for (let currentIdx = 0; currentIdx < elementsForSum; currentIdx++) {
        finalAccumulation += allKnownFactors[allKnownFactors.length - 1 - currentIdx] - 1;
    }
    console.log(finalAccumulation);
};

let receivedInputContent = '';
process.stdin.on('data', (dataChunk) => {
    receivedInputContent += dataChunk;
});

process.stdin.on('end', () => {
    executeCalculation(receivedInputContent);
});