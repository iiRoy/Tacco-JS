// This function processes raw input data to count items meeting specific criteria.
function analyzeItemData(rawDataText) {
    // First, ensure the input string is not null or empty after trimming.
    if (!rawDataText || rawDataText.trim() === '') {
        console.error("No input data provided for analysis.");
        return;
    }

    // Split the entire input string into individual lines, removing any leading/trailing whitespace.
    const allInputLines = rawDataText.trim().split("\n");

    // It's crucial to have at least one line for configuration parameters.
    if (allInputLines.length === 0) {
        console.error("Input data is empty after splitting lines.");
        return;
    }

    // Extract the configuration parameters from the very first line of the input.
    // The expected format is "N H W", where N is a total count (unused here), H is min height, W is min width.
    const configurationParts = allInputLines[0].split(" ");

    // Validate if the configuration line has the expected number of components.
    if (configurationParts.length < 3) {
        console.error("Configuration line is malformed. Expected format: 'N H W'.");
        return;
    }

    // Parse the minimum height and width requirements from the configuration line.
    // Using the Number() constructor for robust conversion, which also handles potential float inputs if needed.
    const minimumAllowedHeight = Number(configurationParts[1]);
    const minimumAllowedWidth = Number(configurationParts[2]);

    // Validate that the parsed minimums are actual numbers.
    if (isNaN(minimumAllowedHeight) || isNaN(minimumAllowedWidth)) {
        console.error("Invalid numeric values for minimum height or width in configuration.");
        return;
    }

    // Initialize a counter to keep track of items that satisfy both height and width conditions.
    let qualifyingItemsCount = 0;

    // Iterate through the remaining lines of the input, which represent individual item dimensions.
    // We use slice(1) to efficiently create a new array containing all lines except the first (config) line.
    for (const currentItemDimensionLine of allInputLines.slice(1)) {
        // Trim any whitespace from the current line and split it into its height and width components.
        const dimensionComponents = currentItemDimensionLine.trim().split(" ");

        // Perform basic validation: ensure each item line has two dimension values.
        if (dimensionComponents.length < 2) {
            // console.warn(`Skipping incomplete item data line: "${currentItemDimensionLine}"`);
            continue; // Skip to the next line if the data is incomplete.
        }

        // Parse the observed height and width of the current item.
        const observedItemHeight = Number(dimensionComponents[0]);
        const observedItemWidth = Number(dimensionComponents[1]);

        // Add a robustness check: ensure that the parsed values are valid numbers.
        if (isNaN(observedItemHeight) || isNaN(observedItemWidth)) {
            // console.warn(`Skipping line with non-numeric dimensions: "${currentItemDimensionLine}"`);
            continue; // Skip this line if parsing failed for either dimension.
        }

        // Evaluate if the current item meets both the specified minimum height and minimum width criteria.
        const meetsAllDimensionCriteria = (observedItemHeight >= minimumAllowedHeight) &&
                                         (observedItemWidth >= minimumAllowedWidth);

        // If the item satisfies all the criteria, increment our counter.
        if (meetsAllDimensionCriteria) {
            qualifyingItemsCount++;
        }
    }

    // Finally, output the total count of items that met the specified criteria to the console.
    console.log(qualifyingItemsCount);
}

// This is the entry point for the script, typically used in environments like competitive programming.
// It reads the entire standard input as a UTF-8 string and passes it to our analysis function.
analyzeItemData(require('fs').readFileSync('/dev/stdin', 'utf8'));