let operationCountTotal; // Global variable to store the total number of operations.
                            // Renamed from 'n' for improved clarity and descriptive purpose.

let orderedStringCollection; // Global array to maintain a sorted list of string elements.
                             // Renamed from 'str' to better reflect its content and ordered nature.

/**
 * Executes a specialized binary search on the `orderedStringCollection` to find a target value.
 * This function determines if the `targetValue` exists within the collection and, if not,
 * identifies the correct index where it should be inserted to maintain sorted order.
 *
 * @param {string} targetValue The string element to search for within the collection.
 * @returns {{found: boolean, insertionIndex: number}} An object containing two properties:
 *   - `found`: A boolean indicating `true` if `targetValue` is present, `false` otherwise.
 *   - `insertionIndex`: If `found` is `true`, this is the index of the `targetValue`.
 *                       If `found` is `false`, this is the index where `targetValue`
 *                       should be placed to preserve the collection's sorted state.
 */
function locateElementPosition(targetValue) {
    let searchLowerBound = 0; // The starting index for the current search segment.
    let searchUpperBound = orderedStringCollection.length - 1; // The ending index for the current search segment.

    // Perform binary search until the bounds cross each other.
    while (searchLowerBound <= searchUpperBound) {
        // Calculate the middle index. Using Math.floor ensures an integer index.
        const middlePointIndex = Math.floor((searchLowerBound + searchUpperBound) / 2);
        const elementAtMiddle = orderedStringCollection[middlePointIndex];

        // Compare the element at the middle index with the target value.
        if (elementAtMiddle === targetValue) {
            // Target value found! Return its index and the 'found' status.
            return { found: true, insertionIndex: middlePointIndex };
        } else if (elementAtMiddle < targetValue) {
            // The target value is greater than the middle element, so it must reside
            // in the upper half of the current search segment. Adjust the lower bound.
            searchLowerBound = middlePointIndex + 1;
        } else {
            // The target value is smaller than the middle element, so it must reside
            // in the lower half of the current search segment. Adjust the upper bound.
            searchUpperBound = middlePointIndex - 1;
        }
    }

    // If the loop completes, the target value was not found in the collection.
    // At this point, `searchLowerBound` holds the correct index where the
    // `targetValue` should be inserted to maintain the sorted order.
    return { found: false, insertionIndex: searchLowerBound };
}


/**
 * Orchestrates the processing of input commands to manage a sorted string collection.
 * This function parses the input, executes 'insert' or 'find' operations, and outputs results.
 *
 * @param {string} rawInputContent The complete string input, typically from standard input,
 *                                 containing the operation count and subsequent commands.
 */
function processInputCommands(rawInputContent) {
    // Break down the raw input string into an array of individual lines.
    const inputLines = rawInputContent.split("\n");

    // The very first line of input provides the total number of operations.
    // Parse it as an integer, ensuring radix 10 for consistency.
    operationCountTotal = parseInt(inputLines[0], 10);

    // Initialize the global sorted collection as an empty array.
    // Using `[]` is more idiomatic than `new Array(0)` in modern JavaScript.
    orderedStringCollection = [];

    // Define constants for command keywords to enhance readability and reduce magic strings.
    const COMMAND_TYPE_INSERT = "insert";
    const COMMAND_TYPE_FIND = "find";

    // --- Input Validation (Type III addition: Guard Clause) ---
    // Check if the parsed operation count is a valid non-negative number.
    if (isNaN(operationCountTotal) || operationCountTotal < 0) {
        console.error("Error: Invalid or negative operation count provided. Please check input format.");
        return; // Exit early if input is invalid.
    }

    // Iterate through each command line, starting from the second line (index 1).
    // The loop runs for `operationCountTotal` times, processing one command per iteration.
    for (let currentOpIndex = 1; currentOpIndex <= operationCountTotal; currentOpIndex++) {
        const currentCommandLine = inputLines[currentOpIndex];

        // --- Robustness Improvement (Type III addition: Skip empty lines) ---
        // Guard against potential empty lines, especially at the end of input files.
        if (!currentCommandLine || currentCommandLine.trim() === '') {
            continue; // Skip processing if the line is empty or just whitespace.
        }

        // Split each command line into its constituent parts: the command type and its argument.
        const commandSegments = currentCommandLine.split(" ");
        const commandKey = commandSegments[0]; // e.g., "insert" or "find"
        const commandArgument = commandSegments[1]; // e.g., "apple" or "banana"

        // --- Structured Command Processing (Type III: Switch statement for clarity) ---
        // Use a switch statement for cleaner handling of different command types.
        switch (commandKey) {
            case COMMAND_TYPE_INSERT:
                // For an 'insert' command, first determine if the value already exists
                // and where it should be placed.
                const insertionResult = locateElementPosition(commandArgument);

                // --- Original Behavior Replication (Type III: Update logic) ---
                // The original code only inserts an element if it is *not* already present.
                // If `insertionResult.found` is true, it means the element exists,
                // and we should do nothing, replicating the original functionality.
                if (!insertionResult.found) {
                    // If the element is not found, insert it at the determined `insertionIndex`.
                    // The `splice` method is used to insert elements into an array at a specific position.
                    orderedStringCollection.splice(insertionResult.insertionIndex, 0, commandArgument);
                }
                // If `insertionResult.found` is true, the `else` branch (implicitly doing nothing)
                // correctly mirrors the original code's behavior of not inserting duplicates.
                break; // End of INSERT_COMMAND_KEYWORD case.

            case COMMAND_TYPE_FIND:
                // For a 'find' command, simply check if the argument exists in the collection.
                const findOperationResult = locateElementPosition(commandArgument);

                // Output "yes" if the element was found, "no" otherwise.
                if (findOperationResult.found) {
                    console.log("yes");
                } else {
                    console.log("no");
                }
                break; // End of FIND_COMMAND_KEYWORD case.

            default:
                // --- Error Handling (Type III addition: Guard Clause/Validation) ---
                // Log a warning if an unrecognized command type is encountered.
                console.warn(`Warning: Unrecognized command '${commandKey}' on line ${currentOpIndex + 1}. Skipping this operation.`);
                break; // End of default case.
        }
    }
}

// --- Application Entry Point (Type III: Robustness for Node.js environment) ---
// This block ensures the code runs when executed as a script in a Node.js environment.
// It reads input from standard input (/dev/stdin) and passes it to the main processing function.
if (typeof require !== 'undefined' && require.main === module) {
    try {
        const fileSystemModule = require("fs"); // Import Node.js File System module.
        const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        processInputCommands(standardInputContent);
    } catch (ioError) {
        // --- Error Handling (Type III: Added Try-Catch for file operations) ---
        // Catch and report any errors that occur during file reading.
        console.error(`Failed to read input from /dev/stdin: ${ioError.message}`);
        // Optionally, one could provide a fallback or default input here for testing.
        // processInputCommands("3\ninsert alpha\nfind beta\ninsert gamma");
    }
}