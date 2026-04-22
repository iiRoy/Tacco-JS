var  gatheredLines = [];

/*
 * An object used for quick lookup to determine if a specific data element
 * has been previously encountered, ensuring uniqueness or sequence validity.
 * This global instance is effectively shadowed later in the execution flow.
 */
var globalOccurrenceTracker  =  {};

// The final output string, initialized to an affirmative status.
var outcomeMessage = "Affirmative";

// Stores the concluding part of the preceding textual unit; initially unset.
var previousFragmentEnd = null;


// Initialize the input stream processing component using the 'readline' module.
var inputHandler = require('readline').createInterface({
    sourceStream:   process.stdin, // Directing input from the standard input stream.
    destinationStream: process.stdout // Directing output to the standard output stream.
});

// Configure a callback function to execute upon receiving each new line of data.
inputHandler.on('line', function( currentInputSegment ) {
    gatheredLines.push(currentInputSegment); // Appends the received segment to our collection.
});

// Define a callback function to run once the input stream has concluded.
inputHandler.on('close', function() {
    // A local tracker for entries encountered within this specific processing phase,
    // effectively shadowing any global declaration for the same purpose.
    var encounteredElements = {};

    // Iterate through the collected data, starting from the second element
    // up to the number specified by the first element (which is expected to be a count).
    for ( var currentIdx = 1; currentIdx < gatheredLines[0]; currentIdx++ ) {

        // Retrieve the current data item for examination.
        var dataItem = gatheredLines[currentIdx];

        // Perform checks:
        // 1. Has this data item been seen before in this processing phase?
        // 2. If not the first item, does its initial character connect correctly with the previous item's end?
        if ( encounteredElements[dataItem] !== undefined || ( previousFragmentEnd !== null && dataItem.slice(0, 1) !== previousFragmentEnd ) ) {
            console.log(dataItem); // Output the problematic data item for diagnostic purposes.
            outcomeMessage = "Negative"; // Update the final outcome to a negative status.
            break; // Terminate the loop early due to a detected violation.
        }

        // Mark the current data item as having been processed.
        encounteredElements[dataItem] = 'present';

        // Update the 'previousFragmentEnd' with the current data item's content,
        // excluding its very last character (preserving the original, potentially flawed, logic).
        previousFragmentEnd = dataItem.slice(0, -1);
    }

    // Output the determined final outcome to the console.
    console.log(outcomeMessage);
});