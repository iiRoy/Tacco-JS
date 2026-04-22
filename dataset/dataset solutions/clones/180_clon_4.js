const checkPrimality = (val) => {
    if (val < 2) return false;
    if (val === 2) return true;
    if (val % 2 === 0) return false;
    const topLimit = Math.trunc(Math.sqrt(val));
    for (let currentDivisor = 3; currentDivisor <= topLimit; currentDivisor += 2) {
        if (val % currentDivisor === 0) return false;
    }
    return true;
};

let receivedDataBuffer = '';
process.stdin.on('data', (inputSegment) => {
    receivedDataBuffer += inputSegment.toString();
});

process.stdin.on('end', () => {
    const inputLines = receivedDataBuffer.trim().split('\n');

    for (const currentInputLine of inputLines) {
        const targetValue = parseInt(currentInputLine, 10);

        let largestPrecedingPrime;
        for (let currentSearch = targetValue - 1; currentSearch >= 2; currentSearch--) {
            if (checkPrimality(currentSearch)) {
                largestPrecedingPrime = currentSearch;
                break;
            }
        }

        let smallestSucceedingPrime;
        let currentSearch = Math.max(3, targetValue + 1);
        while (true) {
            if (checkPrimality(currentSearch)) {
                smallestSucceedingPrime = currentSearch;
                break;
            }
            currentSearch++;
        }
        console.log(largestPrecedingPrime, smallestSucceedingPrime);
    }
});