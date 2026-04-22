// This module provides functionality to analyze a sequence of numerical values.

const calculateHighestGain = (valueList) => { // Define a function to determine the maximum possible gain.
    let itemPosition = 1; // Initialize a counter for iterating through the list elements.
    let highestGain = Number.NEGATIVE_INFINITY; // Stores the maximum difference found, starting with the smallest possible number.
    let lowestObserved = Number.POSITIVE_INFINITY; // Keeps track of the minimum value encountered so far, initialized to a very large number.

    // Loop through the input array starting from the second element, up to the count specified by the first element.
    for (itemPosition = 1; itemPosition < valueList[0]; itemPosition++) {
        // Calculate the potential gain by subtracting the lowest observed value from the current element.
        // Update the highestGain if the current potential gain is greater.
        highestGain = Math.max(highestGain, valueList[itemPosition] - lowestObserved);

        // Display current state for debugging purposes.
        console.log(`Current highest gain: ${highestGain}`);
        console.log(`Current lowest observed: ${lowestObserved}`);
        console.log(`Value at current position: ${valueList[itemPosition]}`);

        // Update the lowestObserved value if the current element is smaller.
        lowestObserved = Math.min(lowestObserved, valueList[itemPosition]);

        // Print an empty line for better readability in console output.
        console.log(``);
    }

    // After the loop, output the final calculated highest gain.
    console.log(highestGain);
};

// Start handling standard input stream from the operating system.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Declare a variable to accumulate all incoming data chunks.
let receivedText = '';

// Attach an event listener for 'data' events on the standard input.
// Each time data is received, append it to the 'receivedText' buffer.
process.stdin.on('data', (inputSegment) => {
    receivedText += inputSegment;
});

// Attach an event listener for the 'end' event on the standard input.
// This event fires when no more data is expected.
process.stdin.on('end', () => {
    // Split the accumulated text by newline characters to get individual lines.
    // Then, filter out any empty lines that might result from the split.
    const processedEntries = receivedText.split('\n').filter((lineContent) => {
        // Ensure only non-empty lines are kept.
        return lineContent !== '';
    });

    // Invoke the core logic function with the prepared array of lines.
    calculateHighestGain(processedEntries);
});