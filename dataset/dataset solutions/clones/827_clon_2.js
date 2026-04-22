let receivedData = require('node:fs').readFileSync('/dev/stdin', 'utf-8'); // Acquire raw data from the standard input stream.

// Process the acquired data: remove any trailing newline characters and then split into an array of individual lines.
let dataLines = (receivedData.replace(/\n+$/, '')).split('\n');

// Begin an infinite processing loop, which will terminate based on a specific input condition.
for (;;) {

    // Extract the first element from the data lines array, convert it to an integer, and use it as an item counter.
    let itemCount = parseInt(dataLines.shift(), 10);

    // If the item count is zero, it signifies the end of input, so exit the loop.
    if (itemCount === 0) {
        break;
    }

    // Initialize an empty array to accumulate the calculated results for the current block of items.
    let finalResults = [];

    // Iterate through the number of items specified by 'itemCount'.
    for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {

        // Retrieve the next line of data, split it by spaces, and store it as an array of strings.
        let currentItemDetails = (dataLines.shift()).split(' ');

        // Remove the first element (which is the item's name/label) from the details array.
        let itemName = currentItemDetails.shift();

        // Convert all remaining elements in the details array from strings to floating-point numbers.
        currentItemDetails = currentItemDetails.map(val => parseFloat(val));

        // Re-insert the item's name/label at the beginning of the details array.
        currentItemDetails.unshift(itemName);

        // Execute an immediately-invoked function expression (IIFE) using the prepared item details.
        // This function calculates performance and profit metrics for each item.
        ((label, initialCost, valA, valB, valC, valD, valE, valF, valS, valM) => {
            // Compute the total operational duration based on various contributing factors.
            let totalDuration = valA + valB + valC + ((valD + valE) * valM);

            // Calculate the net financial gain after deducting the initial cost.
            let netProfit = (valF * valS * valM) - initialCost;

            // Store the item's label, its calculated efficiency (profit per duration), and its original index.
            finalResults.push([label, netProfit / totalDuration, currentIdx]);
        }).apply(null, currentItemDetails); // Apply the function with the array elements as arguments.
    }

    // Sort the collected results array. The primary sorting key is efficiency (descending),
    // and the secondary key is the original input order (ascending) for tie-breaking.
    finalResults.sort((firstItem, secondItem) => {
        // If the efficiency values are identical, sort by their original processing index.
        if (firstItem[1] === secondItem[1]) {
            return firstItem[2] - secondItem[2];
        }
        // Otherwise, sort by efficiency in descending order (higher efficiency first).
        else {
            return secondItem[1] - firstItem[1];
        }
    });

    // Iterate through the sorted results and output only the label of each item.
    finalResults.forEach(itemEntry => {
        console.log(itemEntry[0]); // Display the main identifier for the item.
    });

    // Print a hash symbol as a separator, indicating the completion of processing for the current block of items.
    console.log("#");
}