const calculateCommonSubsequences = (rawInputContent) => {
    const parsedLines = rawInputContent.trim().split('\n');
    const [lenA, lenB] = parsedLines[0].split(' ').map(val => Number(val));
    const arrayA = parsedLines[1].split(' ').map(val => Number(val));
    const arrayB = parsedLines[2].split(' ').map(val => Number(val));
    const primeModulo = 1000000007;

    const memoizationStore = new Map();

    const determineSubsequenceCount = (currentIdxA, currentIdxB) => {
        const uniqueKey = `${currentIdxA},${currentIdxB}`;
        if (memoizationStore.has(uniqueKey)) {
            return memoizationStore.get(uniqueKey);
        }

        if (currentIdxA === 0 || currentIdxB === 0) {
            memoizationStore.set(uniqueKey, 1);
            return 1;
        }

        let computedCount;
        const elementA = arrayA[currentIdxA - 1];
        const elementB = arrayB[currentIdxB - 1];

        if (elementA === elementB) {
            computedCount = (determineSubsequenceCount(currentIdxA - 1, currentIdxB) + determineSubsequenceCount(currentIdxA, currentIdxB - 1)) % primeModulo;
        } else {
            computedCount = (determineSubsequenceCount(currentIdxA - 1, currentIdxB) + determineSubsequenceCount(currentIdxA, currentIdxB - 1) - determineSubsequenceCount(currentIdxA - 1, currentIdxB - 1)) % primeModulo;
            computedCount = (computedCount + primeModulo) % primeModulo;
        }

        memoizationStore.set(uniqueKey, computedCount);
        return computedCount;
    };

    const finalResult = determineSubsequenceCount(lenA, lenB);
    console.log('%s', finalResult);
    return finalResult;
};

calculateCommonSubsequences(require("fs").readFileSync("/dev/stdin", "utf8"));