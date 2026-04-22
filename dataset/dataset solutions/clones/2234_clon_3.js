const fileUtilities = require('fs');

/**
 * Converts an array of string inputs into an array of base-10 integers.
 * This function includes robust validation to ensure all inputs are valid numbers.
 *
 * @param {string[]} inputStringLines - An array where each string is expected to represent a number.
 * @returns {number[]} An array of parsed integer values.
 * @throws {Error} If the input array is invalid, or if any string cannot be converted to an integer.
 */
function translateRawDataToNumbers(inputStringLines) {
    // Validate the basic structure of the input. We expect an array with at least three elements.
    if (!Array.isArray(inputStringLines) || inputStringLines.length < 3) {
        throw new Error("Input data stream is malformed or incomplete. Expected at least 3 numeric entries.");
    }

    // Use map to iterate and parse each line, applying a strict integer conversion.
    const numericalParameters = inputStringLines.map((lineContent, indexPosition) => {
        // Trim whitespace from the current line and attempt to parse it as an integer.
        const numericalValue = parseInt(lineContent.trim(), 10);

        // Check if the parsing operation resulted in a non-numeric value (NaN).
        if (isNaN(numericalValue)) {
            throw new Error(`Data conversion failed: Entry at index ${indexPosition + 1} ("${lineContent}") is not a valid integer.`);
        }
        return numericalValue;
    });

    return numericalParameters;
}

/**
 * Executes a simulation to determine the number of operational cycles required
 * to fully process a given quantity, using two depleting resource dimensions.
 * In each cycle, the larger of the two current resource dimensions determines
 * the processing rate, and the smaller dimension is decremented.
 *
 * @param {number} initialDimensionX - The starting value for the first resource dimension.
 * @param {number} initialDimensionY - The starting value for the second resource dimension.
 * @param {number} totalQuantityToProcess - The total amount that needs to be consumed or processed.
 * @returns {number} The total count of completed operational cycles. Returns 0 if initial conditions are invalid or no quantity needs processing.
 * @throws {Error} (Implicitly, if inputs are extremely large causing overflow, but not explicitly handled here)
 */
function computeOperationalCycles(initialDimensionX, initialDimensionY, totalQuantityToProcess) {
    // Pre-check: If there's nothing to process or if initial dimensions are non-positive,
    // no cycles are needed or possible under normal operation.
    if (totalQuantityToProcess <= 0 || initialDimensionX <= 0 || initialDimensionY <= 0) {
        // Returning 0 for these edge cases prevents unnecessary computation or potential infinite loops.
        // For stricter error handling, an error could be thrown instead.
        return 0;
    }

    // Initialize mutable variables for the simulation.
    let currentDimensionX = initialDimensionX;
    let currentDimensionY = initialDimensionY;
    let remainingQuantity = totalQuantityToProcess;
    let cycleCounter = 0; // This variable tracks the number of iterations.

    // The core simulation loop continues as long as there is quantity left to process.
    while (remainingQuantity > 0) {
        let currentCycleConsumptionRate; // Variable to store the rate for the current iteration.

        // Determine which dimension is currently larger to set the consumption rate.
        // The larger dimension dictates consumption, while the smaller one is reduced.
        if (currentDimensionX > currentDimensionY) {
            currentCycleConsumptionRate = currentDimensionX; // Consume based on Dimension X
            currentDimensionY = currentDimensionY - 1;       // Decrement Dimension Y
        } else {
            // This path handles cases where Dimension Y is larger or equal to Dimension X.
            currentCycleConsumptionRate = currentDimensionY; // Consume based on Dimension Y
            currentDimensionX = currentDimensionX - 1;       // Decrement Dimension X
        }

        // Subtract the determined consumption rate from the total remaining quantity.
        remainingQuantity = remainingQuantity - currentCycleConsumptionRate;

        // Increment the cycle counter for each completed operation.
        cycleCounter = cycleCounter + 1;

        // Safety break: Prevents potential infinite loops in unforeseen edge cases or very large inputs.
        // While the logic should naturally terminate, this acts as a safeguard.
        if (cycleCounter > 10000000) { // A large, arbitrary limit to prevent runaway processes.
            console.warn("Simulation halted: Exceeded maximum allowed operational cycles. Check input parameters.");
            break; // Exit the loop to prevent resource exhaustion.
        }
    }

    return cycleCounter; // Return the final count of cycles.
}

/**
 * Outputs a given numerical result to the standard console.
 *
 * @param {number} finalNumericalResult - The number to be displayed.
 */
function presentResultToUser(finalNumericalResult) {
    console.log(finalNumericalResult);
}

/**
 * The primary function that orchestrates the entire process:
 * 1. Reads raw input from the standard input stream.
 * 2. Parses and validates the input data.
 * 3. Executes the core calculation logic.
 * 4. Displays the final computed result.
 * Includes comprehensive error handling for robustness.
 */
function orchestrateProcessingPipeline() {
    try {
        // Stage 1: Acquire raw data from the environment's standard input.
        // The data is read as a UTF-8 string, trimmed of whitespace, and then split into individual lines.
        const acquiredRawInput = fileUtilities
                                   .readFileSync('/dev/stdin', 'utf8')
                                   .trim()
                                   .split('\n');

        // Stage 2: Transform the raw string lines into a structured array of numbers.
        // This step also includes validation for data integrity.
        const processedNumericalInputs = translateRawDataToNumbers(acquiredRawInput);

        // Stage 3: Deconstruct the array of numbers into clearly named variables
        // for better readability and to match the function's expected parameters.
        const [firstDimension, secondDimension, quantityToProcess] = processedNumericalInputs;

        // Stage 4: Perform the central computational task using the validated inputs.
        const totalCyclesAchieved = computeOperationalCycles(firstDimension, secondDimension, quantityToProcess);

        // Stage 5: Present the final calculated result to the user.
        presentResultToUser(totalCyclesAchieved);

    } catch (operationalError) {
        // Centralized error reporting: Any error occurring in the pipeline is caught here
        // and its message is logged to the console, providing user feedback.
        console.error("Critical error during execution:", operationalError.message);
        // Optionally, a non-zero exit code could be used here to signal a failure to the system.
        // process.exit(1);
    }
}

// Initiate the complete processing workflow when the script is executed.
orchestrateProcessingPipeline();