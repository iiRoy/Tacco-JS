// Utility for acquiring input data
const acquireSystemInput = () => {
    try {
        // Attempt to read from standard input
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (inputError) {
        // Log error and provide a default string for testing or fallback scenarios
        // console.error("Could not read from standard input, using a default value.", inputError.message);
        return "10 50"; // Example fallback data for demonstration
    }
};

// Core calculation engine
const processResourceAllocation = (rawInputString) => {
    // Step 1: Input validity check
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.length === 0) {
        // If input is null, undefined, not a string, or empty, return '0' indicating an issue
        // console.error("Invalid or empty input string provided.");
        return "0";
    }

    // Step 2: Normalize and dissect the input string
    const cleanedInput = rawInputString.trim();
    // Split by any sequence of whitespace characters
    const numericSegments = cleanedInput.split(/\s+/);

    // Step 3: Ensure sufficient data points are present
    if (numericSegments.length < 2) {
        // If fewer than two numbers are found, the input is incomplete
        // console.error("Input string does not contain enough numeric segments.");
        return "0";
    }

    // Step 4: Parse string segments into integer values
    const primaryItemCountString = numericSegments[0];
    const totalResourceCapacityString = numericSegments[1];

    const baseUnitCount = parseInt(primaryItemCountString, 10); // Corresponds to N
    const overallResourcePool = parseInt(totalResourceCapacityString, 10); // Corresponds to M

    // Step 5: Validate parsed numerical values
    if (isNaN(baseUnitCount) || isNaN(overallResourcePool) || baseUnitCount < 0 || overallResourcePool < 0) {
        // Ensure both parsed values are non-negative integers
        // console.error("Parsed values are not valid non-negative integers.");
        return "0";
    }

    // Define constants for resource costs
    const requiredUnitsPerBaseItem = 2;
    const additionalUnitsPerBonusItem = 4;

    // Calculate resources consumed by base items
    const consumedByBaseItems = baseUnitCount * requiredUnitsPerBaseItem;

    let computedFinalResult;

    // Conditional logic based on resource availability
    // Original condition: N * 2 <= M
    // Rewritten condition: overallResourcePool >= consumedByBaseItems
    if (overallResourcePool >= consumedByBaseItems) {
        // Calculate remaining resources after allocating for base items
        const remainingResources = overallResourcePool - consumedByBaseItems;

        // Determine how many additional items can be formed from remaining resources
        // Using bitwise right shift for efficient floor division by 4 (2^2)
        const bonusItemsAchieved = remainingResources >> 2;

        // Sum base items and bonus items
        computedFinalResult = baseUnitCount + bonusItemsAchieved;
    } else {
        // If not enough resources for all base items, calculate based on overall pool
        // Original: Math.floor(M/2)
        // Rewritten using bitwise right shift for efficient floor division by 2 (2^1)
        computedFinalResult = overallResourcePool >> 1;
    }

    // Step 6: Convert the numerical result to a string for output
    return String(computedFinalResult);
};

// Entry point for the program execution
const launchProgram = () => {
    // Obtain the initial input string
    const environmentInput = acquireSystemInput();
    // Process the input and get the calculated value
    const finalCalculatedValue = processResourceAllocation(environmentInput);
    // Output the result to the console
    console.log(finalCalculatedValue);
};

// Execute the program
launchProgram();