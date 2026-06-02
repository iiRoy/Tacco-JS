const performArrayXorAccumulation = (initialValue, sourceArray, startIndex, limitIndex) => {
    let accumulator = initialValue;
    for (let currentIdx = startIndex; currentIdx < limitIndex; currentIdx++) {
        accumulator ^= sourceArray[currentIdx];
    }
    return accumulator;
};

console.log((inputStringContent => {
    const processedInputData = inputStringContent.trim();
    const inputDataLines = processedInputData.split('\n');

    const firstLineValues = inputDataLines[0].split(' ').map(BigInt);
    const secondLineValues = inputDataLines[1].split(' ').map(BigInt);

    const totalElementsCount = firstLineValues[0];
    const mainBigIntArray = secondLineValues;

    for (let iterationCandidate = 1n; iterationCandidate <= mainBigIntArray[0]; iterationCandidate++) {
        const firstTerm = mainBigIntArray[0] - iterationCandidate;
        const secondTerm = mainBigIntArray[1] + iterationCandidate;
        let currentXorSum = firstTerm ^ secondTerm;

        const finalComputedXor = performArrayXorAccumulation(
            currentXorSum,
            mainBigIntArray,
            2,
            Number(totalElementsCount)
        );

        if (finalComputedXor === 0n) {
            return String(iterationCandidate);
        }
    }

    return '-1';
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
