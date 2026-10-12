function generatePrimesMap(upperBound) {
    const potentialPrimes = new Set();
    for (let num = 2; num <= upperBound; num++) {
        potentialPrimes.add(num);
    }

    // To ensure primes are processed in ascending order for the Sieve logic,
    // we convert the Set to a sorted Array for iteration.
    const sortedCandidates = Array.from(potentialPrimes).sort((a, b) => a - b);

    for (let i = 0; i < sortedCandidates.length; i++) {
        const currentCandidate = sortedCandidates[i];

        // Optimization: If currentCandidate squared exceeds upperBound,
        // all remaining candidates in sortedCandidates are prime.
        if (currentCandidate * currentCandidate > upperBound) {
            break;
        }

        // If currentCandidate has already been removed (i.e., it's a multiple of a smaller prime), skip.
        if (!potentialPrimes.has(currentCandidate)) {
            continue;
        }

        // Remove all multiples of the current prime candidate.
        // Start from currentCandidate * currentCandidate as smaller multiples
        // would have already been removed by smaller primes.
        for (let multiple = currentCandidate * currentCandidate; multiple <= upperBound; multiple += currentCandidate) {
            potentialPrimes.delete(multiple);
        }
    }

    // Convert the Set of primes into an object for behavioral equivalence with the original.
    const primeRegistry = {};
    for (let pNum of potentialPrimes) {
        primeRegistry[pNum] = true;
    }
    return primeRegistry;
}

// Pre-calculate primes up to 1,000,000
const primeNumbersMap = generatePrimesMap(1000000);

// Helper function to process all input cases upfront
const parseAllInputCases = (rawInputContent) => {
    const allLines = rawInputContent.trim().split('\n');
    let currentLineIndex = 0;
    const getNextInputLine = () => allLines[currentLineIndex++];

    const processedCases = [];
    while (true) {
        const [itemCount, targetSum] = getNextInputLine().split(' ').map(Number);
        if (itemCount === 0 && targetSum === 0) break;

        const caseElements = [];
        for (let k = 0; k < itemCount; k++) {
            caseElements.push(Number(getNextInputLine()));
        }
        processedCases.push({ itemCount, targetSum, caseElements });
    }
    return processedCases;
};

// Read all input
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const allProblemCases = parseAllInputCases(rawInputData);

// Process each problem case
for (const currentProblem of allProblemCases) {
    const { itemCount: n, targetSum: x, caseElements: inputValues } = currentProblem;
    const MAX_REACHABLE_SUM = 1000000;

    // Use a Set to store all sums that can be formed by subsets of inputValues.
    // This implements an unbounded knapsack-like dynamic programming approach.
    let possibleSums = new Set([0]); // Base case: sum of 0 is always possible (empty subset).

    for (const elementValue of inputValues) {
        // To correctly implement unbounded knapsack with a Set, iterate over
        // existing sums in ascending order. This ensures that a sum `S` formed
        // by `elementValue` can then be used to form `S + elementValue` in the
        // same iteration for the same `elementValue`.
        const sumsToExtend = Array.from(possibleSums).sort((a, b) => a - b);

        for (const existingSum of sumsToExtend) {
            const newPotentialSum = existingSum + elementValue;
            if (newPotentialSum <= MAX_REACHABLE_SUM) {
                possibleSums.add(newPotentialSum);
            }
        }
    }

    // Search for the largest prime sum less than or equal to x.
    let resultPrimeSum = null;
    for (let currentCheckSum = x; currentCheckSum > 0; currentCheckSum--) {
        if (possibleSums.has(currentCheckSum) && primeNumbersMap.hasOwnProperty(currentCheckSum)) {
            resultPrimeSum = currentCheckSum;
            break;
        }
    }

    console.log(resultPrimeSum === null ? "NA" : resultPrimeSum);
}
