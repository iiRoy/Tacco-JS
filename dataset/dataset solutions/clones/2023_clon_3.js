// This module provides a utility for calculating a specific score based on a numerical input.

/**
 * Reads content from the standard input stream.
 * @returns {string} The content read from stdin, or an empty string if an error occurs.
 */
const readInputSource = () => {
    try {
        // Using 'node:fs' for clarity that it's a Node.js built-in module.
        return require('node:fs').readFileSync('/dev/stdin', 'utf8');
    } catch (error) {
        // Log an error but continue with an empty string to prevent crashing.
        console.error("Error reading from standard input:", error.message);
        return "";
    }
};

/**
 * Displays the final computed numerical result to the console.
 * @param {number} valueToDisplay The numerical result to be shown.
 */
const displayCalculatedOutput = (valueToDisplay) => {
    // We could format this further, but for this clone, a direct log is sufficient.
    console.log(valueToDisplay);
};

/**
 * Executes the primary value computation logic based on an incoming text stream.
 * @param {string} incomingTextStream The raw string data received for processing.
 */
const executeValueComputation = (incomingTextStream) => {
    // Constants defining the problem's parameters.
    const MAJOR_UNIT_SIZE = 500;
    const MINOR_UNIT_SIZE = 5;
    const MAJOR_UNIT_VALUE_MULTIPLIER = 1000;
    const MINOR_UNIT_VALUE_MULTIPLIER = 5;
    const RADIX_BASE = 10; // For parseInt

    // Step 1: Sanitize the raw input.
    const cleanedDataSegment = incomingTextStream.trim();

    // Step 2: Extract the initial numerical value from the first character.
    // Use Number.parseInt with explicit radix for robustness.
    let initialIntegralInput = Number.parseInt(cleanedDataSegment.charAt(0), RADIX_BASE);

    // Guard clause: Validate the extracted numerical input.
    // If it's not a valid number or out of a reasonable range, handle it.
    if (isNaN(initialIntegralInput) || initialIntegralInput < 0) {
        console.warn("Invalid or negative numerical input detected. Defaulting to zero for computation.");
        initialIntegralInput = 0; // Default to zero or throw an error, depending on desired behavior.
    }

    // Intermediate object to store calculation results.
    const calculatedQuantities = {
        countOfMajorUnits: 0,
        countOfMinorUnits: 0,
        residualAmount: 0,
    };

    // Calculate the count of major units.
    calculatedQuantities.countOfMajorUnits = Math.floor(initialIntegralInput / MAJOR_UNIT_SIZE);

    // Calculate the residual amount after extracting major units using the modulo operator.
    calculatedQuantities.residualAmount = initialIntegralInput % MAJOR_UNIT_SIZE;

    // A small check: if residual is less than minor unit, then minor unit count is 0.
    // This is implicitly handled by Math.floor, but adds an explicit step for clarity.
    if (calculatedQuantities.residualAmount < MINOR_UNIT_SIZE) {
        calculatedQuantities.countOfMinorUnits = 0;
    } else {
        // Calculate the count of minor units from the residual.
        calculatedQuantities.countOfMinorUnits = Math.floor(calculatedQuantities.residualAmount / MINOR_UNIT_SIZE);
    }

    // Step 3: Compute the final aggregated valuation.
    // Break down the final calculation into a more verbose intermediate step.
    const majorUnitsContribution = calculatedQuantities.countOfMajorUnits * MAJOR_UNIT_VALUE_MULTIPLIER;
    const minorUnitsContribution = calculatedQuantities.countOfMinorUnits * MINOR_UNIT_VALUE_MULTIPLIER;

    const aggregatedValuation = majorUnitsContribution + minorUnitsContribution;

    // Step 4: Display the final result.
    displayCalculatedOutput(aggregatedValuation);
};

// Application entry point:
// 1. Fetch the raw input data.
// 2. Pass it to the main computation function.
executeValueComputation(readInputSource());