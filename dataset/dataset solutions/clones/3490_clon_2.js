'use strict'; // Enforce strict mode for cleaner code and better error handling

const processInput = (rawData) => {
    // The raw input string is first split into an array of individual lines.
    rawData = rawData.split('\n');

    // The very first line of the input contains two crucial parameters:
    // N (the total number of items that follow) and T (the maximum allowed time).
    // We parse these numeric values from the first line.
    let initialParameters = rawData[0].split(' ').map(itemString => parseInt(itemString, 10));
    const numItems = initialParameters[0]; // Represents 'N' from the problem statement
    const maxTimeLimit = initialParameters[1]; // Represents 'T' from the problem statement

    // Now, we extract the subsequent lines that actually contain the item data.
    // These lines range from the second line (index 1) up to N items after that.
    let itemDescriptionLines = rawData.slice(1, numItems + 1);

    // Initialize a variable to store the minimum cost found so far.
    // We start with a sentinel value (1001) which is guaranteed to be higher
    // than any valid cost (as per problem constraints, costs are typically lower).
    let currentMinimumCost = 1001;

    // Iterate through each line that describes an item.
    itemDescriptionLines.forEach(singleItemLine => {
        // For each item line, parse its cost and time values.
        let parsedItemDetails = singleItemLine.split(' ').map(valueString => parseInt(valueString, 10));
        let itemPrice = parsedItemDetails[0]; // The cost 'c' of the current item
        let itemDuration = parsedItemDetails[1]; // The time 't' taken by the current item

        // Check if this item is a candidate for the minimum cost:
        // 1. Its duration must be strictly less than the maximum allowed time.
        // 2. Its price must be strictly less than the current minimum cost found.
        if (itemDuration < maxTimeLimit && itemPrice < currentMinimumCost) {
            currentMinimumCost = itemPrice; // If both conditions are met, update the minimum cost.
        }
    });

    // After processing all items, determine the final output.
    if (currentMinimumCost === 1001) {
        // If the currentMinimumCost is still the initial sentinel value,
        // it means no item satisfied the given conditions (time limit and cost).
        console.log('TLE'); // Output 'TLE' (Time Limit Exceeded, implying no suitable item found).
    } else {
        // Otherwise, a suitable item was found, and currentMinimumCost holds its minimum price.
        console.log(currentMinimumCost); // Output the lowest cost found.
    }
};

// The program starts by reading the entire input from standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin'
// and then passes the content (decoded as UTF-8) to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
