function processInputData ( rawDataStream ){
    // Deconstructs the raw input into a collection of individual lines.
    let   inputRows = rawDataStream.split("\n")   ;

    // Extracts the primary string that will undergo various manipulations.
    let targetString = inputRows.shift();

    // Parses the second line to determine the total count of operations to be performed.
    let numOperations = parseInt(inputRows.shift());

    // Iterates through each defined operation.
    for (let opIdx = 0; opIdx < numOperations; opIdx++) {
        // Splits the current operation line into its constituent command segments.
        let  commandParts = inputRows[opIdx].split(" ");

        // Identifies the specific type of action to be executed (e.g., print, replace, reverse).
        let operationType = commandParts[0];

        // Converts the string-based index arguments into numerical values using a utility function.
        let indexRange = convertStringsToNumbers([ commandParts[1], commandParts[2] ]) ;

        // --- Logic Branching Based on Operation Type ---

        // Handles the 'print' command, displaying a specified substring.
        if (operationType === "print") {
            // Logs the extracted segment of the target string to the console.
            console.log(targetString.slice(indexRange[0], indexRange[1] + 1));
        }
        // Manages the 'replace' command, substituting a portion of the string.
        else if (operationType === "replace") {
            // Retrieves the new text to insert into the string.
            let replacementText = commandParts[3] ;
            // Reconstructs the target string by injecting the replacement text.
            targetString = targetString.slice(0, indexRange[0]) + replacementText + targetString.slice(indexRange[1] + 1);
        }
        // Executes the 'reverse' command, inverting a specific segment of the string.
        else if (operationType === "reverse") {
            // Isolates the part of the string destined for reversal.
            let segmentToReverse = targetString.slice(indexRange[0], indexRange[1] + 1);
            let reversedSegment = ""; // Initializes an empty container for the reversed characters.

            // Iteratively builds the reversed segment by appending characters from end to start.
            for (let charIdx = 0; charIdx < segmentToReverse.length; charIdx++) {
                reversedSegment += segmentToReverse[segmentToReverse.length - charIdx - 1];
            }
            // Updates the main target string with the newly reversed segment.
            targetString = targetString.slice(0, indexRange[0]) + reversedSegment + targetString.slice(indexRange[1] + 1);
        }
    }
}

// Utility function to transform an array of string representations of numbers into actual integers.
function convertStringsToNumbers ( stringArray ){
    return stringArray.map(stringValue => parseInt(stringValue));
}


// --- Main Program Invocation ---
// Reads all data from standard input asynchronously and passes it to the primary processing routine.
processInputData( require("fs").readFileSync("/dev/stdin", "utf-8") );