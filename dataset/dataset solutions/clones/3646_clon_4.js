const PRIME_MODULUS = 1000000007;

let inputSequenceString;
let characterArray;

const ioProvider = require('readline');
const interfaceHandle = ioProvider.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandle.on('line', (dataLine) => {
    inputSequenceString = dataLine;
});

interfaceHandle.on('close', () => {
    characterArray = inputSequenceString.split('');
    const sequenceLength = characterArray.length;

    const memoizationCache = new Map();

    const targetPattern = ['A', 'B', 'C'];

    const calculateWays = (currentPosition, segmentProgress) => {
        if (segmentProgress === targetPattern.length) {
            return 1;
        }
        if (currentPosition === sequenceLength) {
            return 0;
        }

        const cacheKey = `${currentPosition}-${segmentProgress}`;
        if (memoizationCache.has(cacheKey)) {
            return memoizationCache.get(cacheKey);
        }

        let totalCombinations = 0;
        const currentCharacter = characterArray[currentPosition];

        // Path 1: The current character is NOT used to advance the target pattern match.
        // It's either skipped or acts as a non-matching character.
        // If it's '?', it implies 3 choices for this character that don't advance the segment.
        let combinationsIfSkipped = calculateWays(currentPosition + 1, segmentProgress);
        if (currentCharacter === '?') {
            combinationsIfSkipped = (combinationsIfSkipped * 3) % PRIME_MODULUS;
        }
        totalCombinations = (totalCombinations + combinationsIfSkipped) % PRIME_MODULUS;

        // Path 2: The current character IS used to advance the target pattern match.
        // This is only possible if we still need to match more characters (segmentProgress < 3).
        if (segmentProgress < targetPattern.length) {
            const requiredChar = targetPattern[segmentProgress];
            if (currentCharacter === '?' || currentCharacter === requiredChar) {
                const combinationsIfUsed = calculateWays(currentPosition + 1, segmentProgress + 1);
                totalCombinations = (totalCombinations + combinationsIfUsed) % PRIME_MODULUS;
            }
        }

        memoizationCache.set(cacheKey, totalCombinations);
        return totalCombinations;
    };

    console.log(calculateWays(0, 0));
});