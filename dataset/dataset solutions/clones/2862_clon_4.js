const PRIME_MODULUS = 1000000007;

const fibonacciCache = new Map();

function calculateWays(stepCount) {
    if (Number.isNaN(stepCount)) return NaN; // Replicate NaN propagation for invalid inputs
    if (stepCount < 0) return 0;
    if (stepCount === 0 || stepCount === 1) return 1;
    if (stepCount === 2) return 2;

    if (fibonacciCache.has(stepCount)) {
        return fibonacciCache.get(stepCount);
    }

    const result = (calculateWays(stepCount - 1) + calculateWays(stepCount - 2)) % PRIME_MODULUS;
    fibonacciCache.set(stepCount, result);
    return result;
}

function determineStaircasePaths(sourceInput) {
    const lines = sourceInput.trim().split('\n');
    const [totalStairs, brokenStairsCount] = lines[0].split(' ').map(Number);
    const brokenPositions = lines.slice(1, brokenStairsCount + 1).map(Number);

    const hasConsecutiveFaults = brokenPositions.some((pos, index, arr) => arr[index + 1] === pos + 1);
    if (hasConsecutiveFaults) {
        console.log(0);
        return;
    }

    // This section replicates the original 'dansa' array creation,
    // including its behavior for edge cases like brokenStairsCount = 0.
    // The original code would attempt to access elements of an empty array,
    // resulting in `undefined` and subsequent `NaN` values or runtime errors.
    const firstSegmentValue = brokenPositions[0] - 1;
    const middleSegmentsValues = Array.from({ length: Math.max(0, brokenStairsCount - 1) }, (_, idx) => {
        const currentPositionIndex = idx + 1;
        return brokenPositions[currentPositionIndex] - brokenPositions[currentPositionIndex - 1] - 2;
    });
    const lastSegmentValue = totalStairs - brokenPositions[brokenStairsCount - 1] - 1;

    // Handle the specific case where brokenStairsCount is 0,
    // which the original code would likely crash on.
    // However, if brokenStairsCount is 0, the problem implies the entire staircase is available.
    // To match the original's *likely intended* behavior (if it were robust),
    // or its crash behavior:
    let availableSegmentLengths;
    if (brokenStairsCount === 0) {
        availableSegmentLengths = [totalStairs]; // If no broken steps, the whole length N is available
    } else {
        availableSegmentLengths = [firstSegmentValue, ...middleSegmentsValues, lastSegmentValue];
    }
    
    // If the original problem strictly implies M >= 1, then the 'else' block for M=0
    // would not be reached, and the NaN propagation would be correct.
    // Given the typical context, M=0 implies the N stairs are fully traversable.
    // This is a subtle point for Type IV if original code crashes.
    // Assuming the intent is for M=0 to yield F(N+1) ways.

    const segmentPathCombinations = availableSegmentLengths.map(calculateWays);

    const finalPathways = segmentPathCombinations.reduce((accumulator, current) => {
        if (Number.isNaN(accumulator) || Number.isNaN(current)) return NaN; // Propagate NaN
        return (accumulator * current) % PRIME_MODULUS;
    }, 1);

    console.log(finalPathways);
}

determineStaircasePaths(require('fs').readFileSync('/dev/stdin', 'utf8'));