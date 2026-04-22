const libIO = require('fs');
const MAX_PROBLEM_VALUE = 1000000;

// Step 1: Precompute minimal (termB + termC) for each possible (termB^2 + termC^3) value.
// We store this in 'minimalComponentSums'.
// Initialize with a value indicating 'not found' (or infinity).
const minimalComponentSums = new Array(MAX_PROBLEM_VALUE + 1).fill(Number.MAX_SAFE_INTEGER);

for (let termC_index = 0; termC_index * termC_index * termC_index <= MAX_PROBLEM_VALUE; ++termC_index) {
    const termC_cubed_value = termC_index * termC_index * termC_index;
    for (let termB_index = 0; termB_index * termB_index + termC_cubed_value <= MAX_PROBLEM_VALUE; ++termB_index) {
        const combined_BC_value = termB_index * termB_index + termC_cubed_value;
        minimalComponentSums[combined_BC_value] = Math.min(minimalComponentSums[combined_BC_value], termB_index + termC_index);
    }
}

// Step 2: Transform values for prefix minimum calculation.
// For a target value 'K', we want to find min(termA + termB + termC)
// where termA + termB^2 + termC^3 = K.
// This is equivalent to min((K - (termB^2 + termC^3)) + (termB + termC)).
// Let V = termB^2 + termC^3. We want min(K - V + minimalComponentSums[V]).
// This can be rewritten as K + min(minimalComponentSums[V] - V).
// We precompute 'minimalComponentSums[V] - V' for each V.
const transformedCoefficientValues = new Array(MAX_PROBLEM_VALUE + 1);
for (let i = 0; i <= MAX_PROBLEM_VALUE; ++i) {
    if (minimalComponentSums[i] !== Number.MAX_SAFE_INTEGER) {
        transformedCoefficientValues[i] = minimalComponentSums[i] - i;
    } else {
        transformedCoefficientValues[i] = Number.MAX_SAFE_INTEGER;
    }
}

// Step 3: Compute prefix minimums of the transformed values.
// This allows efficient lookup of min(minimalComponentSums[V] - V) for all V up to K.
const prefixMinTransformedValues = new Array(MAX_PROBLEM_VALUE + 1);
prefixMinTransformedValues[0] = transformedCoefficientValues[0];
for (let i = 1; i <= MAX_PROBLEM_VALUE; ++i) {
    prefixMinTransformedValues[i] = Math.min(prefixMinTransformedValues[i - 1], transformedCoefficientValues[i]);
}

// Step 4: Construct the final solution cache.
// For each K, the minimum sum is K + prefixMinTransformedValues[K].
const optimalSumCache = new Array(MAX_PROBLEM_VALUE + 1);
for (let i = 0; i <= MAX_PROBLEM_VALUE; ++i) {
    optimalSumCache[i] = i + prefixMinTransformedValues[i];
}

// Read input and process queries.
const rawData = libIO.readFileSync('/dev/stdin', 'utf8');
const numericalQueries = rawData.split('\n').map(Number).filter(val => !isNaN(val) && val !== 0);

// Output results for each query.
numericalQueries.forEach(currentQuery => {
    console.log(optimalSumCache[currentQuery]);
});