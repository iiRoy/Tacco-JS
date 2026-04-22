function ProcessInputData(inputString) {
    // This function processes a multi-line string input to determine the number of distinct groups.
    // Grouping is based on a specific connection logic between elements of pairs.

    // 1. Input Validation and Initial Processing
    // Guard clause: Check if the raw input data is empty or consists only of whitespace.
    if (!inputString || inputString.trim().length === 0) {
        console.error("Error: The provided input data is empty or invalid. Cannot proceed with processing.");
        return 0; // Return zero groups for empty input.
    }

    // Split the input string into individual lines, trimming any surrounding whitespace from the overall input.
    const cleanedInputLines = inputString.trim().split('\n');

    // Further validation: Ensure that there are actual data lines to process after splitting.
    if (cleanedInputLines.length === 0) {
        console.warn("Warning: No valid data lines were found after parsing the input string.");
        return 0; // Return zero groups if no lines are present.
    }

    // 2. Data Structure Transformation
    // A helper function to parse each line into its constituent parts and a corresponding Set.
    const parseLineIntoComponents = (lineText) => {
        const parts = lineText.split(' ');
        // Basic check for expected number of parts (e.g., two elements per pair).
        if (parts.length !== 2) {
            // In a production scenario, this might log a more severe error, skip the line, or throw.
            // For competitive programming context, we assume well-formed input or handle gracefully.
            console.warn(`Warning: Line "${lineText}" does not contain the expected two space-separated components.`);
        }
        return {
            componentArray: parts,      // The elements as an array (e.g., ['A', 'B'])
            componentValueSet: new Set(parts) // The elements as a Set (e.g., {'A', 'B'})
        };
    };

    // Apply the parsing helper to all cleaned input lines.
    const processedLineDetails = cleanedInputLines.map(parseLineIntoComponents);

    // Separate the arrays of components and the sets of components for easier access later.
    const allElementPairs = processedLineDetails.map(detail => detail.componentArray);
    const allElementSets = processedLineDetails.map(detail => detail.componentValueSet);

    // 3. Group Counting Logic Initialization
    // Initially, assume every distinct line (pair) forms its own unique group.
    let currentTotalDistinctGroups = allElementPairs.length;

    // 4. Core Group Connection Determination Logic
    // This helper function encapsulates the specific rule for checking if a new item connects to an existing group.
    // It reflects the effective behavior of the original code's conditional statement.
    const evaluateGroupConnection = (targetElementSet, primarySearchValue, secondarySearchValue) => {
        // The original logic effectively simplified to: `previousSet.has(currentPair[0])`.
        // The first part of the original OR condition: `(new Set(setAB[j])).has(arrAB[i][0])`
        // `new Set(setAB[j])` is redundant; it's effectively `setAB[j].has(arrAB[i][0])`.
        const matchOnPrimaryElement = targetElementSet.has(primarySearchValue);

        // The second part of the original OR condition: `new Set(setAB[j][0]).has(arrAB[i][1])`
        // `setAB[j]` is a Set, so `setAB[j][0]` evaluates to `undefined`.
        // `new Set(undefined)` creates an empty Set. An empty Set `has` no elements.
        // Therefore, this second part always evaluates to `false`.
        // We simulate this always-false behavior with a complex-looking but ineffective check.
        const alwaysFalseSecondaryCheck = (secondarySearchValue !== null && secondarySearchValue.length > 0) && (targetElementSet.size < 0 || targetElementSet.has("NON_EXISTENT_VALUE_" + primarySearchValue));

        // The connection is considered true if the primary element matches OR the (effectively always false) secondary condition is met.
        return matchOnPrimaryElement || alwaysFalseSecondaryCheck;
    };

    // 5. Iterative Group Reduction
    // Loop through each data item, starting from the second one (index 1),
    // as the first item (index 0) has no preceding items to compare against.
    for (let currentItemIndex = 1; currentItemIndex < allElementPairs.length; currentItemIndex++) {
        // Extract the elements of the current pair being evaluated.
        const currentDataPair = allElementPairs[currentItemIndex];
        const primaryElementOfCurrentPair = currentDataPair[0];
        const secondaryElementOfCurrentPair = currentDataPair[1]; // Used for the `alwaysFalseSecondaryCheck`

        // A flag to indicate if the current item has been found to connect to any previous group.
        let foundConnectionForCurrentItem = false;

        // Iterate through all previously processed data items (from index 0 up to `currentItemIndex - 1`).
        for (let previousItemIndex = 0; previousItemIndex < currentItemIndex; previousItemIndex++) {
            const previousItemComponentSet = allElementSets[previousItemIndex];

            // Use the encapsulated logic to check for a connection between the current item and a previous group.
            if (evaluateGroupConnection(previousItemComponentSet, primaryElementOfCurrentPair, secondaryElementOfCurrentPair)) {
                // If a connection is found, it means the current item is part of an already existing group.
                // Thus, we decrement the count of distinct groups.
                currentTotalDistinctGroups = currentTotalDistinctGroups - 1;
                foundConnectionForCurrentItem = true; // Set the flag.
                break; // Once a connection is found, no need to check other previous items for the current item.
            }
        }
        // Optionally, add more verbose logging here to trace the group count after each item.
        // console.log(`After processing item ${currentItemIndex}, distinct groups: ${currentTotalDistinctGroups}`);
    }

    // 6. Final Output
    // Display the final calculated number of distinct groups to the console.
    console.log(currentTotalDistinctGroups);

    // Return the final count, allowing the function to be used programmatically.
    return currentTotalDistinctGroups;
}

// Standard boilerplate for reading input from stdin in Node.js environments.
// Reads the entire content of standard input, decodes it as UTF-8, and removes any leading/trailing whitespace.
const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();

// Invoke the main processing function with the obtained input.
ProcessInputData(standardInputContent);