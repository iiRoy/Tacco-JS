((inputString) => {
    const MOD_VALUE = 1000000007;

    const [numN, numK] = inputString.split(' ').map(Number);

    const calculateGCD = (valA, valB) => {
        while (valB !== 0) {
            const temp = valB;
            valB = valA % valB;
            valA = temp;
        }
        return valA;
    };

    const precomputedGCDFrequency = new Map();
    for (let currentJIndex = 0; currentJIndex < numK; ++currentJIndex) {
        const gcdCountsForCurrentJ = new Map();
        for (let currentXIndex = 0; currentXIndex < numK; ++currentXIndex) {
            const commonDivisor = calculateGCD(currentJIndex + 1, currentXIndex + 1);
            gcdCountsForCurrentJ.set(commonDivisor, (gcdCountsForCurrentJ.get(commonDivisor) || 0) + 1);
        }
        precomputedGCDFrequency.set(currentJIndex, gcdCountsForCurrentJ);
    }

    const dpStates = new Map();

    const initialIterationCounts = new Map();
    for (let g = 1; g <= numK; ++g) {
        initialIterationCounts.set(g, 1);
    }
    dpStates.set(0, initialIterationCounts);

    for (let currentIteration = 1; currentIteration < numN; ++currentIteration) {
        const currentIterationResult = new Map();
        const previousIterationResult = dpStates.get(currentIteration - 1);

        for (const [prevGCDValue, prevGCDCount] of previousIterationResult.entries()) {
            const precomputedForPrevGCD = precomputedGCDFrequency.get(prevGCDValue - 1);

            for (const [nextGCDValue, frequency] of precomputedForPrevGCD.entries()) {
                const existingCount = currentIterationResult.get(nextGCDValue) || 0;
                const contribution = (prevGCDCount * frequency) % MOD_VALUE;
                currentIterationResult.set(nextGCDValue, (existingCount + contribution) % MOD_VALUE);
            }
        }
        dpStates.set(currentIteration, currentIterationResult);
    }

    const finalIterationCounts = dpStates.get(numN - 1);
    const finalSum = Array.from(finalIterationCounts.entries()).reduce((accumulator, [gcdVal, count]) => {
        return (accumulator + (gcdVal * count)) % MOD_VALUE;
    }, 0);

    console.log(finalSum);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
