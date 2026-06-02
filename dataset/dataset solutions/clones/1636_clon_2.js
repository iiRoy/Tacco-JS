(async () => {
    // This block handles asynchronous input processing and calculation.

    let incomingData = ''; // Variable to store all data read from standard input.

    // Asynchronously read data chunks from standard input.
    // Each chunk is appended to the 'incomingData' string.
    for await (const dataPiece of process.stdin) {
        incomingData += dataPiece;
    }

    // Split the accumulated input string into an array of lines.
    const textRows = incomingData.split(/\n/);

    // Extract the first line, split it by whitespace, and convert parts to numbers.
    // These numbers represent the total element count and the number of operations.
    const [elementCount, operationCount] = textRows.shift().split(/\s/).map(strValue => +strValue);

    // Process the next line (which is now the first element of 'textRows').
    // Split it by whitespace, take 'elementCount' items, and transform them.
    // Each item becomes an array: [original_value, current_average, divisor_count].
    let dataEntries = textRows[0].split(/\s/).slice(0, elementCount).map(itemString => [+itemString, +itemString, 1]);

    // Execute the main loop for a specified number of operations.
    for (let iterationIdx = 0; iterationIdx < operationCount; iterationIdx++) {
        // Within each iteration, find the entry in 'dataEntries' that has the highest current average.
        // The current average is stored at index 1 of each inner array.
        let currentHighestEntry = dataEntries.reduce((previousItem, currentItem) => {
            return previousItem[1] > currentItem[1] ? previousItem : currentItem;
        });

        // Increment the divisor count (index 2) for the identified highest entry.
        currentHighestEntry[2]++;
        // Recalculate the current average (index 1) for this entry based on its original value and new divisor count.
        currentHighestEntry[1] = currentHighestEntry[0] / currentHighestEntry[2];
    }

    // After all operations are complete, find the entry with the highest current average one last time.
    let finalHighestEntry = dataEntries.reduce((previousItem, currentItem) => {
        return previousItem[1] > currentItem[1] ? previousItem : currentItem;
    });

    // Output the ceiling of the final highest average to the console.
    console.log(Math.ceil(finalHighestEntry[1]));
})();
