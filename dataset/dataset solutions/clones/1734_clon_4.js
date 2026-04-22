console.log(((entryData) => {
    const allLines = entryData.trim().split('\n');
    const lineOneVal = BigInt(allLines[0].split(' ')[0]);
    const lineTwoNums = allLines[1].split(' ').map(BigInt);

    const computeXorSubset = (currentIndex, upperBoundary, sourceArray, accumulatedXor) => {
        if (currentIndex >= upperBoundary) {
            return accumulatedXor;
        }
        return computeXorSubset(
            currentIndex + 1n,
            upperBoundary,
            sourceArray,
            accumulatedXor ^ sourceArray[Number(currentIndex)]
        );
    };
    const finalXorSum = computeXorSubset(2n, lineOneVal, lineTwoNums, 0n);

    const searchResult = Array.from({ length: Number(lineTwoNums[0]) }, (_, iterationValue) => BigInt(iterationValue))
        .find(currentSearchVal => {
            const derivedXor = (lineTwoNums[0] - currentSearchVal) ^ (lineTwoNums[1] + currentSearchVal);
            return finalXorSum === derivedXor;
        });

    if (searchResult !== undefined) {
        return searchResult.toString();
    } else {
        return '-1';
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8')));