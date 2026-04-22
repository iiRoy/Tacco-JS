function arrangeDescending(elements) {
    // Create a shallow copy to avoid modifying the original array
    const collection = [...elements];
    const elementCount = collection.length;

    // Implement a Bubble Sort algorithm for descending order
    for (let outerIndex = 0; outerIndex < elementCount - 1; outerIndex++) {
        for (let innerIndex = 0; innerIndex < elementCount - 1 - outerIndex; innerIndex++) {
            // If the current element is less than the next, swap them
            if (collection[innerIndex] < collection[innerIndex + 1]) {
                const temporaryHolder = collection[innerIndex];
                collection[innerIndex] = collection[innerIndex + 1];
                collection[innerIndex + 1] = temporaryHolder;
            }
        }
    }
    return collection;
}

function handleData(incomingPayload) {
    // Extract all numbers from the input string using a regular expression
    // and convert them to numeric type.
    const allNumericEntries = incomingPayload.match(/\d+/g).map(Number);

    // The first two numbers represent configuration parameters (e.g., N and K)
    const configurationParameters = allNumericEntries.slice(0, 2);
    const requiredSumCount = configurationParameters[1]; // This corresponds to K

    // The remaining numbers are the actual values to be processed
    const itemValues = allNumericEntries.slice(2);

    // Sort the item values in descending order using our custom sorting function
    const orderedItems = arrangeDescending(itemValues);

    // Output the fully sorted collection
    console.log(orderedItems);

    // Calculate the sum of the first 'requiredSumCount' (K) elements
    // using the functional 'reduce' method.
    const cumulativeTotal = orderedItems.slice(0, requiredSumCount)
                                        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Output the calculated cumulative total
    console.log(cumulativeTotal);
}

// Read the raw text input from standard input and pass it to the processing function.
const systemInput = require("node:fs").readFileSync("/dev/stdin", "utf8");
handleData(systemInput);