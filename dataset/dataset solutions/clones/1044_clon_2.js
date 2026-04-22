var totalCount; // Global variable to store the total number of operations.
var sortedList;   // Global variable to hold the dynamically maintained sorted collection of strings.

/**
 * Performs a modified binary search on the global 'sortedList' to find the
 * appropriate insertion point for a target value or confirm its existence.
 *
 * @param {string} targetValue The string value to locate within the list.
 * @returns {number} Returns -1 if the 'targetValue' is found in the 'sortedList'.
 *                   If not found, it returns the index of the last 'middleIdx' checked,
 *                   which is used by the calling function to determine the insertion spot.
 */
function findPosition(targetValue) {
    var startIdx = 0;                       // Initialize the starting index of the search range.
    var endIdx = sortedList.length - 1;   // Initialize the ending index of the search range.

    var middleIdx; // Variable to store the calculated middle index during the search.

    // Continue the search as long as the start index does not exceed the end index.
    while (startIdx <= endIdx) {
        // Calculate the middle index, rounding down to ensure an integer.
        middleIdx = Math.floor((startIdx + endIdx) / 2);

        // Compare the value at the middle index with the target value.
        if (sortedList[middleIdx] === targetValue) {
            // If a match is found, return -1 to indicate existence.
            return -1;
        } else if (sortedList[middleIdx] < targetValue) {
            // If the middle element is smaller, search in the upper half.
            startIdx = middleIdx + 1;
        } else {
            // If the middle element is larger, search in the lower half.
            endIdx = middleIdx - 1;
        }
    }
    // If the loop completes, the target value was not found.
    // Return the last calculated middle index, which provides a reference point
    // for potential insertion.
    return middleIdx;
}


/**
 * The primary function that processes a series of commands from input,
 * managing insertions and searches within a global sorted list.
 *
 * @param {string} rawInputData A multi-line string containing all input commands.
 */
function ProcessInput(rawInputData) {
    // Split the raw input string into an array of individual lines.
    var commandLines = rawInputData.split("\n");

    // Parse the first line to get the total count of subsequent operations.
    totalCount = parseInt(commandLines[0], 10);

    // Initialize the global sorted list as an empty array.
    sortedList = new Array(0);

    // Define command string constants for better readability.
    var insertCommandType = "insert";
    var findCommandType = "find"; // Although not explicitly checked, implied by 'else'.

    // Iterate through each operation line, starting from the second line (index 1).
    for (var currentOpIndex = 1; currentOpIndex <= totalCount; currentOpIndex++) {
        // Split the current command line into its components (command and value).
        var currentOperation = commandLines[currentOpIndex].split(" ");

        // Check if the command is an 'insert' operation.
        if (currentOperation[0] === insertCommandType) {
            // If the list is currently empty, simply add the new element.
            if (sortedList.length === 0) {
                sortedList.push(currentOperation[1]);
            }
            // If the list is not empty, determine where to insert the new element.
            else {
                // Use the custom binary search to find the potential insertion point.
                var insertionPoint = findPosition(currentOperation[1]);

                // If 'insertionPoint' is not -1, it means the element was not found,
                // and we should proceed with insertion.
                if (insertionPoint >= 0) {
                    // Compare the new value with the value at the 'insertionPoint' to
                    // decide whether to insert before or after it.
                    if (sortedList[insertionPoint] > currentOperation[1]) {
                        // Insert the new value at 'insertionPoint'.
                        sortedList.splice(insertionPoint, 0, currentOperation[1]);
                    } else {
                        // Insert the new value immediately after 'insertionPoint'.
                        sortedList.splice(insertionPoint + 1, 0, currentOperation[1]);
                    }
                }
                // If insertionPoint was -1, the element already exists, so no action is taken (no duplicates).
            }
        }
        // If the command is not 'insert', assume it's a 'find' operation.
        else {
            // Perform a search for the specified value.
            if (findPosition(currentOperation[1]) === -1) {
                // If the 'findPosition' returns -1, the value was located.
                console.log("yes");
            } else {
                // Otherwise, the value was not found in the list.
                console.log("no");
            }
        }
    }
}

// Read the entire content of standard input synchronously and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));