/*
 * This JavaScript module encapsulates a computational routine designed to
 * determine if a specific arithmetic relationship holds true for any
 * combination within a defined two-dimensional parameter space.
 *
 * The primary function processes an input string containing three space-separated
 * numerical values: two limits for iteration and a target sum.
 * It then exhaustively searches for a pair of indices (x, y) within these limits
 * such that a derived formula (y * N + x * M - 2 * x * y) matches the target sum.
 *
 * Author: Advanced Clone Generation System
 * Date: 2023-10-27
 */

var evaluateGridCondition = function(inputString) {
    // A boolean flag to track whether the desired mathematical condition
    // has been met during the extensive search process.
    let conditionMetIndicator = false;

    // Step 1: Deconstruct the incoming input string into individual components.
    // The input is anticipated to be a sequence of numbers separated by spaces.
    const stringComponents = inputString.split(' ');
    const processedNumericalValues = [];

    // Step 2: Convert each string component into an integer and perform basic validation.
    // This loop ensures that all parts of the input are indeed valid numbers.
    for (let currentComponentIndex = 0; currentComponentIndex < stringComponents.length; currentComponentIndex++) {
        const numericalRepresentation = parseInt(stringComponents[currentComponentIndex], 10);

        // If any component cannot be parsed as a number, it indicates an invalid input.
        if (isNaN(numericalRepresentation)) {
            console.error("Input Processing Error: Found non-numeric data. Please provide valid integers.");
            return -1; // Signifies an error state for the caller.
        }
        processedNumericalValues.push(numericalRepresentation);
    }

    // Step 3: Validate the quantity of parameters received.
    // This routine expects exactly three numerical parameters.
    if (processedNumericalValues.length !== 3) {
        console.error("Input Parameter Error: Expected 3 numerical parameters, but received " + processedNumericalValues.length + ".");
        return -1; // Signifies an incorrect parameter count.
    }

    // Step 4: Assign the parsed numerical values to meaningfully named constants.
    // These constants represent the boundaries for our iterative search and the target value.
    const outerLoopBoundary = processedNumericalValues[0]; // Corresponds to 'N' in original logic.
    const innerLoopBoundary = processedNumericalValues[1]; // Corresponds to 'M' in original logic.
    const requiredEquationResult = processedNumericalValues[2]; // Corresponds to 'K' in original logic.

    // A quick preliminary check for unusual boundary conditions.
    // While not strictly an error for `for` loops, negative boundaries are conceptually odd.
    if (outerLoopBoundary < 0 || innerLoopBoundary < 0) {
        console.warn("Warning: One or both iteration boundaries are negative. Loops will not execute, or might behave unexpectedly.");
        // The loops will naturally handle this by not iterating if boundary is 0 or less.
    }

    // Step 5: Initiate the core search operation using nested iteration.
    // 'firstIterator' corresponds to 'i' and 'secondIterator' corresponds to 'j'.
    // The loops iterate inclusive of their respective boundaries.
    for (let firstIterator = 0; firstIterator <= outerLoopBoundary; firstIterator++) {
        for (let secondIterator = 0; secondIterator <= innerLoopBoundary; secondIterator++) {

            // Calculate intermediate components of the target equation.
            // Original formula: j * (N - i) + i * (M - j)
            // Algebraically equivalent and re-ordered: (j * N) + (i * M) - (2 * i * j)
            const componentOne = secondIterator * outerLoopBoundary;      // Represents j * N
            const componentTwo = firstIterator * innerLoopBoundary;       // Represents i * M
            const componentThree = 2 * firstIterator * secondIterator;    // Represents 2 * i * j

            // Compute the total sum for the current (firstIterator, secondIterator) pair.
            const currentIterationSum = componentOne + componentTwo - componentThree;

            // Step 6: Compare the computed sum against the required target result.
            if (currentIterationSum === requiredEquationResult) {
                conditionMetIndicator = true; // Update the flag to reflect success.
                console.log('CONDITION SATISFIED!'); // Output a clear success message.
                return 0; // Terminate early as the goal has been achieved.
            }
        }
    }

    // Step 7: If the entire search completes and no match was found,
    // the 'conditionMetIndicator' will still be false.
    if (!conditionMetIndicator) {
        console.log('NO MATCH FOUND.'); // Output a clear failure message.
    }

    // Regardless of outcome, return a standard success code for function completion.
    return 0;
};

// This section handles the execution flow, reading input from the standard input stream.
// It retrieves the raw data, trims any leading/trailing whitespace, and passes it
// to our main evaluation function.
evaluateGridCondition(require("fs").readFileSync("/dev/stdin", "utf8").trim());