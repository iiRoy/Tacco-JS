const rli = require('readline');

const inputReader = rli.createInterface({
    input: process.stdin,
    output: process.stdout
});

let capturedLines = [];
inputReader.on('line', (currentLine) => {
    capturedLines.push(currentLine);
});

inputReader.on('close', () => {
    processInput();
});

function processInput() {
    let lineCursor = 0;
    const extractInteger = () => parseInt(capturedLines[lineCursor++], 10);
    const extractIntegers = () => capturedLines[lineCursor++].split(' ').map(Number);

    let finalTarget = extractInteger();
    const rangeCount = extractInteger();

    finalTarget -= 1; // Adjust target as per original logic

    const availableSteps = new Set();
    for (let k = 0; k < rangeCount; ++k) {
        const [lowerBound, upperBound] = extractIntegers();
        for (let currentStep = lowerBound; currentStep <= upperBound; ++currentStep) {
            availableSteps.add(currentStep);
        }
    }

    const modulusValue = 998244353;

    // Memoization table to store computed results for subproblems
    // Initialized with -1 to indicate uncomputed states
    const memoizationCache = new Array(finalTarget + 1).fill(-1);

    // Convert the set of steps to a sorted array for consistent iteration order,
    // mimicking C++ std::set's sorted iteration.
    const orderedSteps = Array.from(availableSteps).sort((a, b) => a - b);

    // Recursive function to determine the number of distinct paths to a given sum
    // This replaces the nested iterative loops of the original DP.
    function computePathCount(currentSum) {
        // Base cases for recursion
        if (currentSum < 0) {
            return 0; // Cannot form a negative sum
        }
        if (currentSum === 0) {
            // In the original C++ code, dps[0] remains 0.
            // The logic `dps[*itr]+=1` and `dps[i] = (dps[i] + dps[i-*itr])`
            // implies that a sum of 0 itself doesn't contribute to paths,
            // and `i > *itr` prevents using dps[0] directly.
            return 0;
        }

        // Return cached result if already computed
        if (memoizationCache[currentSum] !== -1) {
            return memoizationCache[currentSum];
        }

        let currentSumWays = 0;

        // First, account for the direct path where 'currentSum' itself is an allowed step.
        // This corresponds to the `dps[*itr]+=1` initialization in the original code.
        if (availableSteps.has(currentSum)) {
            currentSumWays = 1;
        }

        // Recursively sum up ways from previous states using all valid steps.
        // This replaces the inner loop `for(auto itr = st.begin(); ...)`
        for (const stepSize of orderedSteps) {
            if (currentSum > stepSize) { // Equivalent to original `i > *itr` condition
                currentSumWays = (currentSumWays + computePathCount(currentSum - stepSize)) % modulusValue;
            }
        }

        // Store and return the computed result
        memoizationCache[currentSum] = currentSumWays;
        return currentSumWays;
    }

    // Output the final result for the adjusted target
    console.log(computePathCount(finalTarget));
}
