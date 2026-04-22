'use strict'; // Enforcing strict parsing and error handling rules for the entire script

/**
 * Utility function to convert a string into a validated integer.
 * Handles potential non-numeric inputs by returning 0, or flooring floats.
 * @param {string} textValue - The string to be parsed into an integer.
 * @returns {number} The parsed integer value.
 */
const extractNumericComponent = (textValue) => {
    const convertedNumber = Number(textValue); // Use Number() for broader conversion
    // Validate if the conversion resulted in a finite number
    if (isNaN(convertedNumber) || !Number.isFinite(convertedNumber)) {
        return 0; // Default or error value for invalid numeric input
    }
    return Math.floor(convertedNumber); // Ensure integer result
};

/**
 * Computes the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * This implementation is iterative.
 * @param {number} operandA - The first integer.
 * @param {number} operandB - The second integer.
 * @returns {number} The greatest common divisor of operandA and operandB.
 */
const calculateEuclideanGCD = (operandA, operandB) => {
    // Ensure inputs are non-negative for consistent GCD behavior
    let currentA = Math.abs(operandA);
    let currentB = Math.abs(operandB);

    // Loop until the second operand becomes zero
    while (currentB !== 0) {
        let remainderStorage = currentB; // Temporarily store the value of B
        currentB = currentA % currentB;  // B becomes the remainder of A divided by B
        currentA = remainderStorage;     // A takes the value that B previously held
    }
    return currentA; // When B is 0, A holds the GCD
};

/**
 * Orchestrates the main logic for the problem: finding the maximum GCD
 * of N-1 numbers from a given set of N numbers.
 * @param {string} rawInputContent - The entire input string, typically from stdin.
 */
function processComputationalTask(rawInputContent) {
    // Divide the input into an array of strings, one for each line
    const allInputLines = rawInputContent.split('\n');

    // Determine the total quantity of numbers from the first line
    const totalNumbersQuantity = extractNumericComponent(allInputLines[0]);

    // Process the second line to get the actual list of numbers
    // Filter out any empty string segments that might arise from split()
    const numericalDataset = allInputLines[1]
                                .split(' ')
                                .filter(segment => segment.length > 0) // Remove empty strings
                                .map(extractNumericComponent); // Convert each segment to an integer

    // Initialize the variable to track the highest GCD found throughout all scenarios.
    // The smallest possible GCD for positive integers is 1.
    let globalMaximumGCD = 1;

    // Preliminary check for valid input size.
    // In competitive programming, input is often guaranteed valid, but robust code checks.
    if (totalNumbersQuantity < 1 || numericalDataset.length !== totalNumbersQuantity) {
        console.error("Data integrity issue: Mismatch in declared count and actual numbers provided.");
        if (totalNumbersQuantity < 1) { // If no numbers are expected or provided
            console.log(globalMaximumGCD); // Output 1 as a default for no numbers
            return;
        }
    }

    // Outer loop: Simulates removing each number one by one.
    // 'exclusionIndex' points to the number that is currently "removed" from the set.
    for (let exclusionIndex = 0; exclusionIndex < totalNumbersQuantity; ++exclusionIndex) {
        let currentSubsetGCD = -1; // Sentinel value to indicate no numbers processed yet

        // First, find an initial number from the subset (excluding the one at 'exclusionIndex')
        // to start the GCD calculation for the current scenario.
        for (let initialElementScan = 0; initialElementScan < totalNumbersQuantity; ++initialElementScan) {
            if (initialElementScan !== exclusionIndex) {
                currentSubsetGCD = numericalDataset[initialElementScan];
                break; // Found the first valid element for initialization
            }
        }

        // If, after scanning, no initial element was found (e.g., totalNumbersQuantity was 1),
        // then we cannot compute a GCD for this scenario, so skip to the next.
        if (currentSubsetGCD === -1) {
            continue;
        }

        // Inner loop: Iterate through all numbers in the dataset to compute their GCD,
        // specifically ignoring the number at 'exclusionIndex'.
        for (let elementScanIndex = 0; elementScanIndex < totalNumbersQuantity; ++elementScanIndex) {
            // Skip the element that is conceptually removed in this iteration
            if (elementScanIndex === exclusionIndex) {
                continue;
            }
            
            // Accumulate the GCD for the current subset of numbers
            currentSubsetGCD = calculateEuclideanGCD(currentSubsetGCD, numericalDataset[elementScanIndex]);

            // Optimization: If the current GCD for this subset is already
            // less than or equal to the highest GCD found so far,
            // it's impossible for further calculations in this subset to yield a larger GCD.
            // Therefore, we can terminate early for this 'exclusionIndex'.
            if (currentSubsetGCD <= globalMaximumGCD) {
                break;
            }
        }
        
        // After evaluating all numbers for the current 'exclusionIndex',
        // update the global maximum if the current subset's GCD is greater.
        if (currentSubsetGCD > globalMaximumGCD) {
            globalMaximumGCD = currentSubsetGCD;
        }
    }
   
    // Print the final result, which is the largest GCD found across all possible N-1 subsets.
    console.log(globalMaximumGCD);
}

// Entry point: Read input from standard input and pass it to the main processing function.
// This is typical for execution in online judges or scripting environments.
processComputationalTask(require("fs").readFileSync("/dev/stdin", "utf8"));