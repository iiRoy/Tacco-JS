// --- Type III Clone of a JavaScript code for dynamic programming problem ---

// Define constants for values used throughout the program to enhance readability
// and simplify future modifications.
const COMPUTATION_UPPER_BOUND = 100000;
const ZERO_INDEX_OR_VALUE = 0;
const POSITIVE_ONE = 1;
const REPRESENT_UNREACHABLE = Infinity; // Using Infinity for unreachable states in DP
const FILE_SYSTEM_PATH = '/dev/stdin'; // Standard input file path

// SECTION 1: Generation of the primary numeric sequence
// This sequence corresponds to the original 'a' array. It's a cumulative sum
// where each element is based on the previous one, its index, and a constant increment.
let numericProgressionA = [POSITIVE_ONE]; // Initialize with the first value

// Loop to populate the sequence up to the defined computation limit.
// Using 'let' for block-scoped iteration variables is a Type II change.
for (let currentIdx = POSITIVE_ONE; currentIdx < COMPUTATION_UPPER_BOUND; currentIdx++) {
    // Calculate the value for the current index.
    // Explicitly defining intermediate variables for clarity (Type III change).
    const previousProgressionValue = numericProgressionA[currentIdx - POSITIVE_ONE];
    const indexBasedIncrement = currentIdx + POSITIVE_ONE;
    numericProgressionA[currentIdx] = previousProgressionValue + indexBasedIncrement;
}

// SECTION 2: Generation of the secondary derived sequence
// This sequence corresponds to the original 'b' array. It also represents a cumulative sum,
// but it integrates values from the previously generated `numericProgressionA`.
let derivedSequenceB = [POSITIVE_ONE]; // Initialize with the base value.
let sequenceBuilderIndex = POSITIVE_ONE; // Iterator for building this sequence.

// The loop condition is now explicitly defined in the 'while' statement,
// removing the 'while(true)' and internal 'break' (Type III structural change).
// This loop continues as long as the next potential element does not exceed the upper bound.
while (sequenceBuilderIndex < COMPUTATION_UPPER_BOUND &&
       derivedSequenceB[sequenceBuilderIndex - POSITIVE_ONE] + numericProgressionA[sequenceBuilderIndex] <= COMPUTATION_UPPER_BOUND) {
    // Compute the next element in the derived sequence.
    const priorDerivedValue = derivedSequenceB[sequenceBuilderIndex - POSITIVE_ONE];
    const correspondingProgressionValue = numericProgressionA[sequenceBuilderIndex];
    derivedSequenceB[sequenceBuilderIndex] = priorDerivedValue + correspondingProgressionValue;

    // Advance the index for the next iteration.
    sequenceBuilderIndex++;
}

// SECTION 3: Initialization of dynamic programming arrays
// These arrays will store the minimum number of steps (elements used from `derivedSequenceB`)
// to reach a specific sum.
// `minCountAllElements`: for any elements from `derivedSequenceB`.
// `minCountOddElements`: for only odd-valued elements from `derivedSequenceB`.
// Using `new Array().fill()` for initialization is a concise Type III change.
let minCountAllElements = new Array(COMPUTATION_UPPER_BOUND).fill(REPRESENT_UNREACHABLE);
let minCountOddElements = new Array(COMPUTATION_UPPER_BOUND).fill(REPRESENT_UNREACHABLE);

// Base cases: It takes zero steps to achieve a sum of zero.
minCountAllElements[ZERO_INDEX_OR_VALUE] = ZERO_INDEX_OR_VALUE;
minCountOddElements[ZERO_INDEX_OR_VALUE] = ZERO_INDEX_OR_VALUE;

// SECTION 4: Dynamic Programming Calculation Process
// This section fills the `minCountAllElements` and `minCountOddElements` arrays.
// It iterates through all possible target sums and all available "coin" values
// from the `derivedSequenceB`.
for (let currentTargetSum = ZERO_INDEX_OR_VALUE; currentTargetSum < COMPUTATION_UPPER_BOUND; currentTargetSum++) {
    // Iterate through each value in the derived sequence, which acts as our available "steps" or "coins".
    for (let currentSequenceItemIndex = ZERO_INDEX_OR_VALUE; currentSequenceItemIndex < derivedSequenceB.length; currentSequenceItemIndex++) {
        const itemValue = derivedSequenceB[currentSequenceItemIndex];
        const remainingSum = currentTargetSum - itemValue;

        // Ensure that using this item results in a non-negative remaining sum.
        // This acts as a guard clause (Type III change).
        if (remainingSum >= ZERO_INDEX_OR_VALUE) {
            // Calculate potential new step count for `minCountAllElements`.
            const potentialStepsAll = minCountAllElements[remainingSum] + POSITIVE_ONE;
            // Update `minCountAllElements` if a more efficient path is found.
            // Using a ternary operator instead of `Math.min` for structural variation (Type III change).
            minCountAllElements[currentTargetSum] = (potentialStepsAll < minCountAllElements[currentTargetSum]) ? potentialStepsAll : minCountAllElements[currentTargetSum];

            // Check if the current item value is odd, for `minCountOddElements` calculation.
            const isItemValueOdd = (itemValue % 2 === POSITIVE_ONE);
            if (isItemValueOdd) {
                // Calculate potential new step count for `minCountOddElements`.
                const potentialStepsOdd = minCountOddElements[remainingSum] + POSITIVE_ONE;
                // Update `minCountOddElements` if a more efficient path is found.
                minCountOddElements[currentTargetSum] = (potentialStepsOdd < minCountOddElements[currentTargetSum]) ? potentialStepsOdd : minCountOddElements[currentTargetSum];
            }
        }
    }
}

// SECTION 5: Input Processing and Output Generation
// This part reads query numbers from standard input and prints the computed results.
let queryNumbersArray; // Renamed from 'arr'

try {
    // Using 'require' for file system access, standard in Node.js.
    const fileSystemModule = require('fs');
    const rawDataFromFile = fileSystemModule.readFileSync(FILE_SYSTEM_PATH, 'utf8');

    // Process the raw input: trim whitespace, split into lines, filter empty lines, and convert to numbers.
    // Added a filter to handle potential empty lines (Type III robustness change).
    queryNumbersArray = rawDataFromFile.trim().split("\n").filter(line => line.length > ZERO_INDEX_OR_VALUE).map(Number);
} catch (error) {
    // Robust error handling for file reading (Type III addition).
    console.error(`Failed to read input from ${FILE_SYSTEM_PATH}:`, error.message);
    queryNumbersArray = []; // Initialize as empty to prevent further errors.
}

// Process queries from the input array.
// Changed `while(true)` to a more explicit condition checking array length (Type III structural change).
while (queryNumbersArray.length > ZERO_INDEX_OR_VALUE) {
    const currentQuery = queryNumbersArray.shift(); // Remove and get the first query.

    // A query of 0 signals the termination of input, as per problem specification.
    if (currentQuery === ZERO_INDEX_OR_VALUE) {
        break;
    }

    // Input validation: ensure the query number is within valid bounds (Type III addition).
    if (currentQuery < ZERO_INDEX_OR_VALUE || currentQuery >= COMPUTATION_UPPER_BOUND) {
        console.error(`Query value ${currentQuery} is out of expected range [${ZERO_INDEX_OR_VALUE}, ${COMPUTATION_UPPER_BOUND - POSITIVE_ONE}]. Skipping.`);
        continue; // Skip to the next query if invalid.
    }

    // Retrieve the pre-computed results for the current query.
    let resultForAny = minCountAllElements[currentQuery];
    let resultForOdd = minCountOddElements[currentQuery];

    // If a sum is unreachable (represented by Infinity), output -1 as per common practice.
    const finalOutputAny = (resultForAny === REPRESENT_UNREACHABLE) ? -POSITIVE_ONE : resultForAny;
    const finalOutputOdd = (resultForOdd === REPRESENT_UNREACHABLE) ? -POSITIVE_ONE : resultForOdd;

    // Print the results using template literals for clear output formatting (Type II change).
    console.log(`${finalOutputAny} ${finalOutputOdd}`);
}