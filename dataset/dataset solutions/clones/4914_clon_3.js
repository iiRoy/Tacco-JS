function processInputData(rawDataEntries) {
    // Determine the total number of data entries to process, excluding the first line itself.
    // We explicitly convert the string to a number using `Number()` for type safety.
    const totalDataPairs = Number(rawDataEntries[0]);

    // Initialize our primary cumulative values. These act as minimum thresholds that must be met.
    // Using `let` for variables that will be reassigned.
    let currentXValue = 1;
    let currentYValue = 1;

    // Helper function to safely parse a string component into a positive number.
    // This adds a layer of abstraction and potential validation (Type III addition).
    const extractNumericComponent = (componentString) => {
        const parsedValue = Number(componentString);
        // Basic validation: ensure the parsed value is a positive number.
        // If not, default to 1 or handle as an error, depending on problem constraints.
        // For this context, assuming valid positive integers.
        if (isNaN(parsedValue) || parsedValue <= 0) {
            // In a robust system, this might throw an error or log a warning.
            // For typical competitive programming, inputs are well-formed.
            return 1; // Default to a safe positive value.
        }
        return parsedValue;
    };

    // Iterate through each subsequent data entry to update our cumulative values.
    // The loop starts from the second line (index 1) up to `totalDataPairs`.
    for (let dataEntryIndex = 1; dataEntryIndex <= totalDataPairs; dataEntryIndex++) {
        // Fetch the current line of input and split it into its two string components.
        const currentLineEntry = rawDataEntries[dataEntryIndex];
        const valueComponents = currentLineEntry.split(" ");

        // Parse the individual X and Y values for the current iteration using our helper.
        const incomingXComponent = extractNumericComponent(valueComponents[0]);
        const incomingYComponent = extractNumericComponent(valueComponents[1]);

        // --- Type III Change: Consolidate the complex if-else logic ---
        // The original code had a multi-branch if-else structure.
        // This section replaces it with a more direct and unified calculation.
        // The core logic is to find a common scaling factor `k` such that:
        // `k * incomingXComponent >= currentXValue` AND `k * incomingYComponent >= currentYValue`.
        // This implies `k >= currentXValue / incomingXComponent` and `k >= currentYValue / incomingYComponent`.
        // Therefore, `k` must be at least `max(ceil(currentXValue / incomingXComponent), ceil(currentYValue / incomingYComponent))`.

        // Calculate the minimum scaling factor required for the X component.
        // Add a check for `incomingXComponent` to prevent division by zero,
        // although problem constraints typically guarantee positive inputs (Type III addition for robustness).
        let minimumScaleForX = 1;
        if (incomingXComponent > 0) {
            minimumScaleForX = Math.ceil(currentXValue / incomingXComponent);
        }

        // Calculate the minimum scaling factor required for the Y component.
        let minimumScaleForY = 1;
        if (incomingYComponent > 0) {
            minimumScaleForY = Math.ceil(currentYValue / incomingYComponent);
        }

        // Determine the maximum of the two required scaling factors.
        // This ensures both X and Y conditions are met simultaneously with the smallest possible scale.
        const combinedScalingFactor = Math.max(minimumScaleForX, minimumScaleForY);

        // Apply the combined scaling factor to the incoming components to update our cumulative values.
        currentXValue = combinedScalingFactor * incomingXComponent;
        currentYValue = combinedScalingFactor * incomingYComponent;
    }

    // After processing all entries, output the sum of the final cumulative values.
    console.log(currentXValue + currentYValue);
}

// --- Input Handling Section ---
// This part is responsible for reading the input from standard I/O.
// Using `const` for module imports and input data for immutability.
const fileSystemModule = require('fs');

// Read all data from standard input, ensuring UTF-8 encoding.
// `.trim()` removes leading/trailing whitespace, and `.split('\n')` creates an array of lines.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();
const parsedInputLines = rawInputContent.split("\n");

// Execute the main processing function with the prepared input array.
processInputData(parsedInputLines);