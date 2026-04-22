const inputOutputModule = require('readline'); // Import the readline module to handle line-by-line input.

let receivedInputLines = []; // This array will store all lines read from standard input.

// Configure the input processing interface.
// It reads from standard input (process.stdin) and writes to standard output (process.stdout).
const inputInterface = inputOutputModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Attach an event listener for each line received from the input stream.
// Every time a line is entered by the user (or piped to stdin), it's added to our array.
inputInterface.on('line', (individualLineContent) => {
    receivedInputLines.push(individualLineContent);
});

// Attach an event listener for when the input stream is closed.
// This signifies that all input has been received, and the main processing logic can begin.
inputInterface.on('close', () => {
    // --- Input Validation and Parsing ---

    // Guard clause: If no input lines were received, there's nothing to process.
    if (receivedInputLines.length === 0) {
        console.log(0); // Output 0 as there are no items to count.
        return; // Terminate execution.
    }

    // Parse the first number, which indicates the count of "positive" items.
    const firstCountString = receivedInputLines[0];
    const positiveItemsCount = parseInt(firstCountString, 10); // Use parseInt for explicit base conversion.

    // Validate the parsed count for positive items.
    if (isNaN(positiveItemsCount) || positiveItemsCount < 0) {
        console.log(0); // If invalid, assume no positive items contribute.
        return;
    }

    // --- Frequency Tracking ---

    // Initialize a Map to store the net frequency of each unique string.
    // Using a Map provides better performance for string keys compared to a plain object in some scenarios.
    const itemNetFrequencies = new Map();

    // --- Processing Positive Items ---

    // Loop through the lines corresponding to the positive items.
    // These items increment their respective counts in the frequency map.
    // The loop runs from index 1 up to 'positiveItemsCount' (inclusive).
    for (let currentItemIdx = 1; currentItemIdx <= positiveItemsCount; ++currentItemIdx) {
        const currentStringItem = receivedInputLines[currentItemIdx];

        // Retrieve the current count for the item, defaulting to 0 if not present.
        const existingCount = itemNetFrequencies.get(currentStringItem) || 0;
        // Increment the count and update the map.
        itemNetFrequencies.set(currentStringItem, existingCount + 1);
    }

    // --- Processing Negative Items ---

    // Determine the index where the count of "negative" items is specified.
    const negativeCountLinePosition = positiveItemsCount + 1;

    // Guard clause: Check if the line specifying the negative items count exists.
    if (negativeCountLinePosition >= receivedInputLines.length) {
        // If this line is missing, we can't process negative items.
        // Calculate and output the max frequency based only on positive items processed so far.
        let currentMaxFrequency = 0;
        for (const freqValue of itemNetFrequencies.values()) {
            if (freqValue > currentMaxFrequency) {
                currentMaxFrequency = freqValue;
            }
        }
        console.log(currentMaxFrequency);
        return;
    }

    // Parse the second number, which indicates the count of "negative" items.
    const secondCountString = receivedInputLines[negativeCountLinePosition];
    const negativeItemsCount = parseInt(secondCountString, 10);

    // Validate the parsed count for negative items.
    if (isNaN(negativeItemsCount) || negativeItemsCount < 0) {
        // If invalid, proceed with only positive counts (if any).
        let currentMaxFrequency = 0;
        for (const freqValue of itemNetFrequencies.values()) {
            if (freqValue > currentMaxFrequency) {
                currentMaxFrequency = freqValue;
            }
        }
        console.log(currentMaxFrequency);
        return;
    }

    // Define the start and end indices for the loop that processes negative items.
    const startNegativeItemsIdx = positiveItemsCount + 2;
    const endNegativeItemsIdx = positiveItemsCount + 1 + negativeItemsCount;

    // Loop through the lines corresponding to the negative items.
    // These items decrement their respective counts in the frequency map.
    for (let currentItemIdx = startNegativeItemsIdx; currentItemIdx <= endNegativeItemsIdx; ++currentItemIdx) {
        const currentStringItem = receivedInputLines[currentItemIdx];

        // Retrieve the current count for the item, defaulting to 0 if not present.
        // This ensures that items appearing only in the negative list start their count from -1.
        const existingCount = itemNetFrequencies.get(currentStringItem) || 0;
        // Decrement the count and update the map.
        itemNetFrequencies.set(currentStringItem, existingCount - 1);
    }

    // --- Final Result Calculation ---

    // Initialize the variable to store the highest net frequency found.
    // It's initialized to 0 because the problem implies that if all counts are negative,
    // the maximum relevant frequency is 0 (i.e., we don't report negative maximums).
    let overallHighestNetFrequency = 0;

    // Iterate over all the net frequency values stored in our map.
    // This is an efficient way to find the maximum value.
    for (const frequencyValue of itemNetFrequencies.values()) {
        // If the current frequency is greater than our recorded highest, update it.
        if (frequencyValue > overallHighestNetFrequency) {
            overallHighestNetFrequency = frequencyValue;
        }
    }

    // --- Output ---

    // Print the final calculated highest net frequency to standard output.
    console.log(overallHighestNetFrequency);
});