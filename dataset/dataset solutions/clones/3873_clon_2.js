// This module contains a primary routine for processing input data.
function processInputData(sourceData) {
    // Acquire the first numeric descriptor and the initial reference value from the first line.
    // Explicitly converting string parts to integers using parseInt for clarity.
    let itemCounter = parseInt(sourceData[0].split(" ")[0], 10);
    let referenceAmount = parseInt(sourceData[0].split(" ")[1], 10);

    // Prepare a container for numerical elements and an accumulator for their aggregate.
    let numericalCollection = [];
    let cumulativeTotal = 0;

    // Iterate through subsequent data lines, processing each as a numerical entry.
    for (let indexPosition = 1; indexPosition <= itemCounter; indexPosition++) {
        // Convert the current line to a number and add it to the total.
        cumulativeTotal += Number(sourceData[indexPosition]);
        // Also add the numerical value to our collection.
        numericalCollection.push(Number(sourceData[indexPosition]));
    }

    // Arrange the collected numbers in ascending order for further calculations.
    numericalCollection.sort((elementA, elementB) => elementA - elementB);

    // Adjust the reference amount by subtracting the cumulative total of all elements.
    referenceAmount -= cumulativeTotal;

    // Output the final computed value: the item count plus the integer division
    // of the adjusted reference amount by the smallest number in the collection.
    console.log(itemCounter + Math.floor(referenceAmount / numericalCollection[0]));
}

// Execute the data processing routine by feeding it content
// read from the standard input stream.
// The input is read as UTF-8, trimmed, and then segmented into individual lines.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));