const MODULO_VALUE = 1000000007;
const NUCLEOTIDE_CHARS = ['A', 'C', 'G', 'T'];
const FORBIDDEN_PATTERN_AGC = 'AGC';

// Helper function to determine if a sequence fragment contains any forbidden patterns.
// This encapsulates the complex conditional logic from the original.
function containsForbiddenPattern(sequenceFragment) {
    const fragmentLength = sequenceFragment.length;

    // Check for 3-character forbidden permutations
    if (fragmentLength >= 3) {
        const lastThree = sequenceFragment.slice(-3);
        // Direct 'AGC' match
        if (lastThree === FORBIDDEN_PATTERN_AGC) return true;
        // Permutation 'ACG' (A + G + C)
        if (lastThree[0] === 'A' && lastThree[1] === 'C' && lastThree[2] === 'G') return true;
        // Permutation 'GAC' (G + A + C)
        if (lastThree[0] === 'G' && lastThree[1] === 'A' && lastThree[2] === 'C') return true;
    }

    // Check for 4-character forbidden patterns (with a wildcard in the middle)
    if (fragmentLength >= 4) {
        const lastFour = sequenceFragment.slice(-4);
        // Pattern 'A_GC' (A + G + C)
        if (lastFour[0] === 'A' && lastFour[1] === 'G' && lastFour[3] === 'C') return true;
        // Pattern 'AG_C' (A + G + C)
        if (lastFour[0] === 'A' && lastFour[2] === 'G' && lastFour[3] === 'C') return true;
    }

    return false;
}

var memoizationCache = {}; // Cache for storing computed results based on (last 4 chars + current length)

function computeValidSequences(sequenceLength, lastFourChars, currentLength) {
    const cacheKey = lastFourChars + "_" + currentLength;
    if (memoizationCache[cacheKey]) {
        return memoizationCache[cacheKey];
    }

    if (currentLength === sequenceLength) {
        return 1; // Base case: a valid sequence of desired length is found
    }

    let resultCount = 0;
    for (let charIndex = 0; charIndex < NUCLEOTIDE_CHARS.length; charIndex++) {
        const nextChar = NUCLEOTIDE_CHARS[charIndex];
        const nextSequenceFragment = lastFourChars + nextChar;

        // Only proceed if the new fragment does not contain any forbidden patterns
        if (!containsForbiddenPattern(nextSequenceFragment)) {
            const newLastFourChars = nextSequenceFragment.slice(-4); // Keep only the last 4 characters for the next state
            resultCount += computeValidSequences(sequenceLength, newLastFourChars, currentLength + 1);
            resultCount %= MODULO_VALUE; // Apply modulo operation
        }
    }

    memoizationCache[cacheKey] = resultCount;
    return resultCount;
}

const processInput = (rawData) => {
    const sequenceLength = Number(rawData);
    console.log(computeValidSequences(sequenceLength, "", 0));
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
