let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input
let lineSegments = (rawData.replace(/\n$/, "")).split("\n"); // Process the raw data into an array of lines, removing any trailing newline character

while (true) { // Begin main processing loop; continues indefinitely until an explicit break condition is met
    let entryCount = lineSegments.shift() - 0; // Extract the first line, interpret it as the number of entries for the current block, and convert to a numeric type

    if (entryCount === 0) { // Check if the extracted entry count is zero
        break; // If zero, terminate the processing loop
    }

    let resultsList = []; // Initialize an empty array to store the computed results for the current block of entries

    for (let idx = 0; idx < entryCount; idx++) { // Iterate through each entry within the current block, from index 0 up to (but not including) entryCount
        let currentEntryData = (lineSegments.shift()).split(" "); // Retrieve the next line, representing an entry, and split it by spaces into an array of strings

        let entityName = currentEntryData.shift(); // Remove the first element from the entry data array, which is the entity's name

        currentEntryData = currentEntryData.map(Number); // Convert all remaining string elements in the entry data array to numbers

        currentEntryData.unshift(entityName); // Insert the previously extracted entity name back to the beginning of the numeric data array

        // An anonymous function is defined and immediately invoked using 'apply' to process the current entry's data
        (function (itemLabel, initialCost, paramA, paramB, paramC, paramD, paramE, paramF, paramS, paramM) {
            let calcTime = paramA + paramB + paramC + ((paramD + paramE) * paramM); // Calculate a 'time' value based on several parameters
            let calcProfit = (paramF * paramS * paramM) - initialCost; // Calculate a 'profit' value using other parameters and the initial cost
            resultsList.push([itemLabel, calcProfit / calcTime, idx]); // Store the entity's label, the calculated profit-to-time ratio, and its original index in the results list
        }).apply(null, currentEntryData); // The 'apply' method passes the elements of 'currentEntryData' as individual arguments to the anonymous function
    }

    resultsList.sort(function (itemOne, itemTwo) { // Sort the accumulated results list based on specific criteria
        if (itemOne[1] === itemTwo[1]) { // If the profit-to-time ratios (second element) of two items are identical
            return itemOne[2] - itemTwo[2]; // Sort them by their original index (third element) in ascending order
        } else {
            return itemTwo[1] - itemOne[1]; // Otherwise, sort them by their profit-to-time ratio in descending order
        }
    });

    resultsList.forEach(function (resultItem) { // Iterate over each item in the now sorted results list
        console.log(resultItem[0]); // Print the label (first element) of the current result item to the console
    });

    console.log("#"); // Print a hash symbol as a separator after processing and displaying results for each block
}
