const obtainRawData = () => {
    // This function encapsulates raw data acquisition,
    // allowing for potential future changes in input source (e.g., file path, API).
    // For a Type III clone, adding error handling for file operations is a common enhancement.
    try {
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (dataAcquisitionError) {
        // If reading from stdin fails, log the error and indicate a critical failure.
        // This is a robust addition compared to the original's implicit error handling.
        throw new Error(`Failed to read input from /dev/stdin: ${dataAcquisitionError.message}`);
    }
};

const convertToPositiveInteger = (inputString, parameterDescription = "value") => {
    // A dedicated helper for parsing numbers, including validation.
    // This replaces direct usage of `Number()` for enhanced safety and clarity.
    const numericValue = Number(inputString);
    if (isNaN(numericValue) || !Number.isInteger(numericValue) || numericValue <= 0) {
        // Guard clause for invalid numeric input.
        throw new Error(`Invalid ${parameterDescription}: "${inputString}". Must be a positive integer.`);
    }
    return numericValue;
};

const simulateRoundRobinDistribution = (containerQuantity, capacityTarget) => {
    // This function isolates the core simulation logic.
    // Renamed variables for better readability:
    // u -> containerQuantity
    // t -> capacityTarget
    // cU -> currentContainerIndex
    // cT -> transferBufferUnits
    // tArr -> containerFillLevels

    // Initial validation for simulation parameters.
    if (containerQuantity <= 0 || capacityTarget <= 0) {
        console.warn(`Simulation warning: Non-positive parameters received (containers: ${containerQuantity}, capacity: ${capacityTarget}). Skipping this round.`);
        return null; // Indicate that no valid result was produced.
    }

    let currentContainerIndex = 0;
    let transferBufferUnits = capacityTarget; // Units available to distribute in the current "burst".
    // Initialize container levels explicitly with zeros.
    // This avoids `(containerFillLevels[index] || 0)` checks later, simplifying logic.
    const containerFillLevels = new Array(containerQuantity).fill(0);

    // An added counter to prevent potential infinite loops in edge cases,
    // and for debugging or performance analysis.
    let iterationCount = 0;
    const MAX_ITERATIONS = 1_000_000_000; // A large but finite limit.

    // The simulation continues until the currently selected container
    // has its fill level equal to the target capacity.
    while (containerFillLevels[currentContainerIndex] !== capacityTarget) {
        iterationCount++;
        if (iterationCount > MAX_ITERATIONS) {
            console.error("Error: Simulation exceeded maximum allowed iterations. Potential infinite loop detected. Returning -1.");
            return -1; // Indicate a failure state.
        }

        // Check if there are units remaining in the buffer to add to the current container.
        if (transferBufferUnits > 0) {
            // Increment the current container's level and decrement the buffer.
            containerFillLevels[currentContainerIndex]++;
            transferBufferUnits--;
        } else {
            // If the buffer is empty, it signifies a "transfer" event:
            // The current container's contents are moved to the buffer, and the container is emptied.
            transferBufferUnits = containerFillLevels[currentContainerIndex];
            containerFillLevels[currentContainerIndex] = 0;
        }

        // Advance to the next container in a circular manner.
        // Rewritten from `(index + 1) % size` for structural variation.
        currentContainerIndex++;
        if (currentContainerIndex >= containerQuantity) {
            currentContainerIndex = 0; // Wrap around to the first container.
        }
    }

    // The loop terminates when the condition `containerFillLevels[currentContainerIndex] === capacityTarget` is met.
    // The result is the index of this container.
    return currentContainerIndex;
};

// Main application execution block.
try {
    const rawInputContent = obtainRawData();
    const cleanedInput = rawInputContent.trim();

    // Validate that there's actual content after trimming.
    if (!cleanedInput) {
        throw new Error("Input data is empty or contains only whitespace.");
    }

    // Filter out any empty lines that might result from splitting,
    // ensuring we only process valid problem descriptions.
    const allValidProblemLines = cleanedInput.split("\n").filter(line => line.trim() !== '');

    // The original code's outer loop condition `while (lines.length > 1)`
    // implies processing all but the very last line if there are multiple lines.
    // If there's only one line, it's skipped. This behavior is explicitly replicated here.
    let problemSetsToProcess = [...allValidProblemLines]; // Use a copy to allow `shift()`

    let processedRoundCounter = 0; // Keep track of processed sets for context in logs.

    while (problemSetsToProcess.length > 1) {
        const currentProblemDefinition = problemSetsToProcess.shift(); // Get the next line to process.
        processedRoundCounter++;

        const definitionParts = currentProblemDefinition.split(" ");
        // Validate the structure of the input line.
        if (definitionParts.length !== 2) {
            console.error(`Error on input line ${processedRoundCounter} ("${currentProblemDefinition}"): Expected two space-separated numbers. Skipping.`);
            continue;
        }

        let numContainersForRound, targetCapacityForRound;
        try {
            // Parse the numeric values using the helper function for validation.
            numContainersForRound = convertToPositiveInteger(definitionParts[0], "container quantity for round");
            targetCapacityForRound = convertToPositiveInteger(definitionParts[1], "target capacity for round");
        } catch (parsingIssue) {
            console.error(`Parsing error on line ${processedRoundCounter} ("${currentProblemDefinition}"): ${parsingIssue.message}. Skipping.`);
            continue;
        }

        // Execute the core simulation and retrieve the result.
        const finalResolvedContainerIndex = simulateRoundRobinDistribution(numContainersForRound, targetCapacityForRound);

        // Output the result if the simulation was successful.
        if (finalResolvedContainerIndex !== null) {
            console.log(finalResolvedContainerIndex);
        }
    }

} catch (applicationError) {
    // Centralized error handling for any unhandled exceptions during the application's lifecycle.
    console.error("An unrecoverable application error occurred:", applicationError.message);
    // In a production environment, `process.exit(1)` might be used here.
}