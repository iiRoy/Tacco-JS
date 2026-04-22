const fileSystemAccess = require('fs');

const numericConverter = (val) => parseInt(val, 10);

// Extend String and Array prototypes for divergent syntax in parsing
String.prototype.stripWhitespace = function() { return this.trim(); };
String.prototype.divideBy = function(separator) { return this.split(separator); };
Array.prototype.extractFirst = function() { return this.shift(); };
Array.prototype.transformElements = function(converter) { return this.map(converter); };

const obtainProcessedInput = () => {
    const rawInputData = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
    const lineFragments = rawInputData.stripWhitespace().divideBy("\n");

    const extentSpecifiers = lineFragments.extractFirst().divideBy(" ").transformElements(numericConverter);
    const rowDimension = extentSpecifiers[0]; // Original 'n'
    const colDimension = extentSpecifiers[1]; // Original 'm'

    const firstOperandSet = []; // Original 'd' array
    for (let currentIdx = 0; currentIdx < rowDimension; currentIdx++) {
        firstOperandSet.push(numericConverter(lineFragments.extractFirst()));
    }

    const secondOperandSet = []; // Original 'c' array
    for (let currentIdx = 0; currentIdx < colDimension; currentIdx++) {
        secondOperandSet.push(numericConverter(lineFragments.extractFirst()));
    }

    return { rowDimension, colDimension, firstOperandSet, secondOperandSet };
};

// Memoization table using a Map to store previously computed results
const memoizedResults = new Map();

// Custom `Math.min` replacement
const determineLesser = (val1, val2) => val1 < val2 ? val1 : val2;

// Recursive function to calculate the minimum cost
// `cCountAvailable`: number of `secondaryCoefficients` considered (from 0 up to cCountAvailable-1)
// `dCountRequired`: number of `firstOperandSet` elements to cover (from 0 up to dCountRequired-1)
const computeCostRecursively = (cCountAvailable, dCountRequired, primaryValues, secondaryCoefficients) => {
    const memoKey = `${cCountAvailable},${dCountRequired}`;

    if (memoizedResults.has(memoKey)) {
        return memoizedResults.get(memoKey);
    }

    // Base Case 1: If no `d` elements are required, the cost is 0.
    if (dCountRequired === 0) {
        return 0;
    }
    // Base Case 2: If `d` elements are required but no `c` elements are available, cost is infinite.
    if (cCountAvailable === 0) {
        return Number.POSITIVE_INFINITY;
    }

    let potentialMinimum = Number.POSITIVE_INFINITY;

    // Option A: Skip the last considered `c` element (secondaryCoefficients[cCountAvailable-1])
    // The cost to cover `dCountRequired` primary values using `cCountAvailable-1` secondary coefficients.
    const costSkippingCurrentC = computeCostRecursively(cCountAvailable - 1, dCountRequired, primaryValues, secondaryCoefficients);
    potentialMinimum = determineLesser(potentialMinimum, costSkippingCurrentC);

    // Option B: Use the last considered `c` element (secondaryCoefficients[cCountAvailable-1])
    // to match the last required `d` element (primaryValues[dCountRequired-1]).
    // This cost is: (cost to cover `dCountRequired-1` primary values with `cCountAvailable-1` secondary coefficients)
    // + (cost of the current match).
    const costUsingCurrentCForD = computeCostRecursively(cCountAvailable - 1, dCountRequired - 1, primaryValues, secondaryCoefficients) +
                                  secondaryCoefficients[cCountAvailable - 1] * primaryValues[dCountRequired - 1];
    potentialMinimum = determineLesser(potentialMinimum, costUsingCurrentCForD);

    memoizedResults.set(memoKey, potentialMinimum);
    return potentialMinimum;
};

function outputResult(finalValue) {
    console.log(finalValue);
}

// Main execution logic
const { rowDimension: N_items, colDimension: M_coeffs, firstOperandSet: D_values, secondOperandSet: C_coeffs } = obtainProcessedInput();

let overallMinimum = Number.POSITIVE_INFINITY;

// The problem requires finding the minimum cost to cover all N_items from D_values,
// using any number of C_coeffs from 0 up to M_coeffs.
// This is equivalent to finding min(dp[i][N_items]) for i from 0 to M_coeffs.
for (let currentC_limit = 0; currentC_limit <= M_coeffs; currentC_limit++) {
    const costForCurrentLimit = computeCostRecursively(currentC_limit, N_items, D_values, C_coeffs);
    overallMinimum = determineLesser(overallMinimum, costForCurrentLimit);
}

outputResult(overallMinimum);