const rawInputLines = [];

const inputOutputModule = require('readline');

const consoleInterface = inputOutputModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Parses the raw input lines and prepares the necessary data for computation.
 * @param {string[]} linesFromInput - An array of strings, each representing a line of input.
 * @returns {{sequenceSize: number, numericSequence: number[], moduloConstant: number}} The processed data.
 * @throws {Error} If input is invalid or insufficient.
 */
function parseAndPrepareData(linesFromInput) {
    const moduloConstant = 1_000_000_007;

    const firstLine = linesFromInput.shift();
    if (!firstLine) {
        throw new Error("Input error: The initial line specifying sequence size is missing.");
    }
    const sequenceSize = parseInt(firstLine, 10);

    if (isNaN(sequenceSize) || sequenceSize < 0) {
        throw new Error("Input error: Provided sequence size is not a valid non-negative number.");
    }

    const numericSequence = new Array(sequenceSize);

    for (let currentIdx = 0; currentIdx < sequenceSize; currentIdx++) {
        const lineValue = linesFromInput[currentIdx];
        if (lineValue === undefined) {
            throw new Error(`Input error: Insufficient sequence elements. Expected ${sequenceSize}, but received only ${currentIdx}.`);
        }
        numericSequence[currentIdx] = parseInt(lineValue, 10);
        if (isNaN(numericSequence[currentIdx])) {
            throw new Error(`Input error: Element at sequence position ${currentIdx} is not a valid number.`);
        }
    }

    return { sequenceSize, numericSequence, moduloConstant };
}

/**
 * Calculates the number of permutations P(n, k).
 * P(n, k) = n * (n-1) * ... * (n-k+1)
 * @param {number} total - The total number of items (n).
 * @param {number} choose - The number of items to select (k).
 * @returns {number} The permutation result. Returns 0 for invalid inputs.
 */
function calculatePermutations(total, choose) {
    if (choose < 0 || choose > total) {
        return 0; // Invalid permutation scenario
    }
    if (choose === 0) {
        return 1; // P(n, 0) is 1
    }

    let permResult = 1;
    let selectedCount = 0;
    let currentTotal = total; // Use a mutable copy for calculation

    while (selectedCount < choose) {
        permResult *= currentTotal;
        currentTotal--;
        selectedCount++;
    }
    return permResult;
}

/**
 * Calculates the number of combinations C(n, k).
 * C(n, k) = P(n, k) / k! (where k! is P(k, k))
 * @param {number} total - The total number of items (n).
 * @param {number} choose - The number of items to select (k).
 * @returns {number} The combination result. Returns 0 for invalid inputs.
 */
function calculateCombinations(total, choose) {
    // Optimization: C(n, k) = C(n, n-k)
    if (choose > total / 2) {
        choose = total - choose;
    }

    // Handle trivial cases
    if (choose < 0 || total < choose) return 0;
    if (choose === 0 || choose === total) return 1;
    if (choose === 1) return total;

    const numerator = calculatePermutations(total, choose);
    const denominator = calculatePermutations(choose, choose); // This effectively calculates k!
    return numerator / denominator;
}

/**
 * Computes the specific combinatorial count based on the sequence rules.
 * The logic involves counting elements that are different from their immediate successor,
 * and then always including the last element. Finally, combinations of 2 are calculated
 * for these counts.
 * @param {{sequenceSize: number, numericSequence: number[], moduloConstant: number}} data - Prepared input data.
 * @returns {number} The computed result before the final +1 adjustment.
 */
function computeSpecialCombinations(data) {
    const { sequenceSize, numericSequence, moduloConstant } = data;

    // A Map is used for efficient storage and retrieval of element frequencies.
    const elementFrequencies = new Map();
    let cumulativePairCount = 0;

    // Iterate through the sequence, comparing each element with its next.
    // This loop covers indices from 0 up to `sequenceSize - 2`.
    for (let currentIdx = 0; currentIdx < sequenceSize - 1; currentIdx++) {
        const currentElementValue = numericSequence[currentIdx];
        const nextElementValue = numericSequence[currentIdx + 1];

        // If adjacent elements are distinct, increment the frequency count for the current element.
        if (currentElementValue !== nextElementValue) {
            elementFrequencies.set(currentElementValue, (elementFrequencies.get(currentElementValue) || 0) + 1);
        }
    }

    // A specific problem rule: the last element of the sequence always has its frequency incremented.
    const finalElementValue = numericSequence[sequenceSize - 1];
    elementFrequencies.set(finalElementValue, (elementFrequencies.get(finalElementValue) || 0) + 1);

    // Calculate the sum of combinations C(count, 2) for each element's frequency.
    for (const elementCount of elementFrequencies.values()) {
        // Only calculate combinations if there are at least two instances of an element.
        if (elementCount >= 2) {
            const combinationsForCurrentElement = calculateCombinations(elementCount, 2);
            cumulativePairCount = (cumulativePairCount + combinationsForCurrentElement) % moduloConstant;
        }
    }

    return cumulativePairCount;
}

/**
 * Main execution function.
 * Manages the flow from input parsing to calculation and output.
 */
function executeMainLogic() {
    try {
        const processedInput = parseAndPrepareData(rawInputLines);
        const intermediateCalculatedResult = computeSpecialCombinations(processedInput);

        // The problem requires an additional base count, typically +1 for an initial state.
        // Ensure this final addition also respects the modulo constant.
        const finalOutputValue = (intermediateCalculatedResult + 1) % processedInput.moduloConstant;
        console.log(finalOutputValue);

    } catch (error) {
        // Provide informative error messages to standard error.
        console.error("Execution halted due to an error:", error.message);
        // In a production environment, one might choose to exit the process here.
        // process.exit(1);
    }
}

// Attach event listener for each incoming line from standard input.
consoleInterface.on('line', (receivedLine) => {
    rawInputLines.push(receivedLine);
});

// Attach event listener for when the input stream concludes.
// This triggers the main logic execution.
consoleInterface.on('close', executeMainLogic);