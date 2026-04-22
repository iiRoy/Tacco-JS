function ProcessInputString() {
    const inputSequence = next();
    const sequenceLength = inputSequence.length;
    const primeDivisor = 1000000007;
    const modulusBase = 13;
    const finalRemainderTarget = 5;

    const memoizationCache = new Map();

    const generateCacheKey = (pos, rem) => `${pos}-${rem}`;

    const countValidArrangements = (currentPosition, currentAccumulatedRemainder) => {
        if (currentPosition === sequenceLength) {
            return currentAccumulatedRemainder === finalRemainderTarget ? 1 : 0;
        }

        const cacheKey = generateCacheKey(currentPosition, currentAccumulatedRemainder);
        if (memoizationCache.has(cacheKey)) {
            return memoizationCache.get(cacheKey);
        }

        let totalArrangementsForThisPath = 0;
        const characterAtCurrentPosition = inputSequence[currentPosition];

        if (characterAtCurrentPosition === '?') {
            for (let digitValue = 0; digitValue < 10; digitValue++) {
                const nextAccumulatedRemainder = (currentAccumulatedRemainder * 10 + digitValue) % modulusBase;
                totalArrangementsForThisPath = (totalArrangementsForThisPath + countValidArrangements(currentPosition + 1, nextAccumulatedRemainder)) % primeDivisor;
            }
        } else {
            const fixedDigitValue = parseInt(characterAtCurrentPosition, 10);
            const nextAccumulatedRemainder = (currentAccumulatedRemainder * 10 + fixedDigitValue) % modulusBase;
            totalArrangementsForThisPath = (totalArrangementsForThisPath + countValidArrangements(currentPosition + 1, nextAccumulatedRemainder)) % primeDivisor;
        }

        memoizationCache.set(cacheKey, totalArrangementsForThisPath);
        return totalArrangementsForThisPath;
    };

    const finalResult = countValidArrangements(0, 0);

    myout(finalResult);
}