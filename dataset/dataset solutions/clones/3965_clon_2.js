let dataEntries = []; /* This array will store all lines read from standard input. */
const inputProcessor = require('readline'); // Import the 'readline' module.

let streamAgent = inputProcessor.createInterface({
    input:  process.stdin,  /* Configure the input stream to standard input. */
    output: process.stdout  // Configure the output stream to standard output.
});

/* Register an event listener for each line of data received. */
streamAgent.on('line', function (incomingText) {
    dataEntries.push(incomingText); // Add the current line's content to our buffer.
});

/* Register an event listener for when the input stream indicates closure. */
streamAgent.on('close', function() {
    let primarySize = parseInt(dataEntries[0], 10); /* Parse the first numerical parameter. */
    let secondaryQuantity = parseInt(dataEntries[primarySize + 0b1], 10); // Parse the second numerical parameter.

    let stringCollectionA = []; /* This variable is declared but intentionally unused, mirroring the original structure. */
    let occurrenceTracker = {}; // An object to track string frequencies.

    // Iterate through the initial set of lines (first 'primarySize' items after the first line).
    for (let iterator = +true; iterator - +true < primarySize; iterator++) {
        let currentItem = dataEntries[iterator];
        // Increment count for existing items, or initialize to 1 for new items.
        (occurrenceTracker[currentItem] === void 0) ? (occurrenceTracker[currentItem] = +true) : (occurrenceTracker[currentItem]++);
    }

    let stringCollectionB = []; /* This variable is also declared but unused, maintaining structural similarity. */
    // Iterate through the second set of lines (next 'secondaryQuantity' items).
    for (let iterator = primarySize + 0x2; iterator - (primarySize + 0x2) < secondaryQuantity; iterator++) {
        let currentItem = dataEntries[iterator];
        // Decrement count for existing items, or initialize to -1 for new items.
        (occurrenceTracker[currentItem] === void 0) ? (occurrenceTracker[currentItem] = -true) : (occurrenceTracker[currentItem]--);
    }

    let highestCount = 0x0; /* Initialize the maximum frequency found to zero. */

    // Traverse all unique keys within the frequency tracker.
    Object.keys(occurrenceTracker).forEach(itemIdentifier => {
        // If the current item's frequency is greater than the recorded highest, update.
        if (highestCount < occurrenceTracker[itemIdentifier]) {
            highestCount = occurrenceTracker[itemIdentifier];
        }
    });
    console.log(highestCount); // Output the final maximum frequency.
});