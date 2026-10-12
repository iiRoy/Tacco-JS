var totalOperations; // Global variable to store the total number of operations.
var sortedElements;  // Global array to hold elements in sorted order.

/**
 * Performs a modified binary search on the 'sortedElements' array.
 * This function is designed to either find an element or determine its insertion point.
 *
 * @param {string} targetValue The string value to search for within the array.
 * @returns {number} Returns -1 if the 'targetValue' is found.
 *                   If not found, it returns the index where 'targetValue' would be
 *                   inserted to maintain the sorted order.
 */
function locateElementPosition(targetValue) {
    let startIndex = 0; // Initialize the left boundary of the search range.
    let endIndex = sortedElements.length - 1; // Initialize the right boundary of the search range.

    let middleIndex; // Variable to store the calculated middle index.

    // Continue the search as long as the start index does not exceed the end index.
    while (startIndex <= endIndex) {
        // Calculate the middle index, ensuring it's an integer.
        middleIndex = Math.floor((startIndex + endIndex) / 2);

        // Compare the element at the middle index with the target value.
        if (sortedElements[middleIndex] == targetValue) {
            return -1; // The target value was found, return -1 as per original logic.
        } else if (sortedElements[middleIndex] < targetValue) {
            // If the middle element is less than the target, search in the right half.
            startIndex = middleIndex + 1;
        } else {
            // If the middle element is greater than the target, search in the left half.
            endIndex = middleIndex - 1;
        }
    }
    // If the loop completes, the target value was not found.
    // 'middleIndex' now holds the last checked index, which is relevant for insertion.
    return middleIndex;
}

/**
 * The primary function that processes input commands.
 * It reads operations from the input, performs insertions into a sorted list,
 * and checks for the existence of elements.
 *
 * @param {string} rawInputData The complete input string, typically read from stdin.
 */
function ProcessCommands(rawInputData) {
    // Split the entire input string into an array of individual lines.
    let lines = rawInputData.split("\n");

    // Parse the first line to determine the total number of operations to perform.
    totalOperations = parseInt(lines[0], 10);

    // Initialize the global array that will store our sorted elements.
    sortedElements = new Array(0);

    // Define string constants for command types to improve readability.
    const insertCommand = "insert";
    const searchCommand = "find"; // This constant is declared but not directly used in a comparison.

    // Loop through each command line, starting from the second line of the input.
    for (let currentLineIndex = 1; currentLineIndex <= totalOperations; currentLineIndex++) {
        // Split the current command line into its constituent parts (e.g., "insert", "5").
        const commandParts = lines[currentLineIndex].split(" ");

        // Check if the first part of the command indicates an 'insert' operation.
        if (commandParts[0] === insertCommand) {
            // If the sorted elements array is currently empty, simply add the new element.
            if (sortedElements.length === 0) {
                sortedElements.push(commandParts[1]);
            } else {
                // Otherwise, use the binary search function to find the appropriate insertion point.
                const insertionPoint = locateElementPosition(commandParts[1]);

                // If 'insertionPoint' is non-negative, it means the element was NOT found,
                // and 'insertionPoint' indicates where it should be inserted.
                if (insertionPoint >= 0) {
                    // Determine whether to insert before or after the element at 'insertionPoint'.
                    if (sortedElements[insertionPoint] > commandParts[1]) {
                        // Insert the new element at 'insertionPoint'.
                        sortedElements.splice(insertionPoint, 0, commandParts[1]);
                    } else {
                        // Insert the new element immediately after 'insertionPoint'.
                        sortedElements.splice(insertionPoint + 1, 0, commandParts[1]);
                    }
                }
                // If 'insertionPoint' is -1, the element was already present, so no action is taken.
            }
        } else {
            // If the command is not 'insert', it is implicitly a 'find' operation.
            // Perform a binary search to check for the existence of the element.
            if (locateElementPosition(commandParts[1]) === -1) {
                // If the search returns -1, the element was found.
                console.log("yes");
            } else {
                // Otherwise, the element was not found.
                console.log("no");
            }
        }
    }
}

// Read the entire content of standard input synchronously and pass it to the main processing function.
ProcessCommands(require("fs").readFileSync("/dev/stdin", "utf8"));
