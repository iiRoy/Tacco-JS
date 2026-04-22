(inputData => {
    const numberParts = inputData.split(' ').map(Number);
    const sequenceLength = numberParts[0];
    const maxValue = numberParts[1];

    const findCommonDivisor = (valA, valB) => {
        let currentA = valA;
        let currentB = valB;
        while (currentB !== 0) {
            const temporary = currentB;
            currentB = currentA % currentB;
            currentA = temporary;
        }
        return currentA;
    };

    const nextStatePossibilities = new Map(); // Maps previous_gcd_value -> Map<new_gcd_value, count>
    for (let previousGcd = 1; previousGcd <= maxValue; ++previousGcd) {
        const currentTransitionCounts = new Map(); // Maps new_gcd_value -> count
        for (let currentNumber = 1; currentNumber <= maxValue; ++currentNumber) {
            const computedGcd = findCommonDivisor(previousGcd, currentNumber);
            currentTransitionCounts.set(computedGcd, (currentTransitionCounts.get(computedGcd) || 0) + 1);
        }
        nextStatePossibilities.set(previousGcd, currentTransitionCounts);
    }

    const primeNumberMod = 1000000007;

    let currentStateCounts = new Map(); // Maps gcd_value -> count
    // Initialize for sequences of length 1: any value from 1 to maxValue can be chosen,
    // and its "GCD" is itself. There's 1 way to pick each.
    for (let i = 1; i <= maxValue; ++i) {
        currentStateCounts.set(i, 1);
    }

    // Iterate for sequenceLength - 1 steps to build up the DP table
    for (let step = 1; step < sequenceLength; ++step) {
        const nextStateCounts = new Map();
        for (const [prevGcd, countPrev] of currentStateCounts.entries()) {
            // If there are no ways to reach this previous GCD, skip
            if (countPrev === 0) continue;

            const transitionsForPrev = nextStatePossibilities.get(prevGcd);
            if (transitionsForPrev) {
                for (const [newGcd, transitionCount] of transitionsForPrev.entries()) {
                    const existingCount = nextStateCounts.get(newGcd) || 0;
                    const contribution = (countPrev * transitionCount) % primeNumberMod;
                    nextStateCounts.set(newGcd, (existingCount + contribution) % primeNumberMod);
                }
            }
        }
        currentStateCounts = nextStateCounts; // Update state for the next step
    }

    let overallSummation = 0;
    // Calculate the final weighted sum: sum(gcd_value * count_of_sequences_with_that_gcd)
    for (const [gValue, finalCount] of currentStateCounts.entries()) {
        overallSummation = (overallSummation + (gValue * finalCount) % primeNumberMod) % primeNumberMod;
    }

    console.log(overallSummation);

})(require("fs").readFileSync("/dev/stdin", "utf8"));