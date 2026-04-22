'use strict'; // Enable strict mode for better error handling and cleaner code

/**
 * Orchestrates the processing of raw input data to determine a specific outcome.
 * This function takes a string of data, parses it, and performs calculations.
 * @param {string} sourceContent - The raw string input, typically from a file or standard input.
 */
function calculateResult(sourceContent) {

    // Step 1: Parse the incoming string.
    // It's split by newlines or spaces to separate individual values,
    // then each string segment is converted into an integer using parseInt.
    const parsedNumericValues = sourceContent.split(/\n|\s/).map(
        (stringPart) => parseInt(stringPart, 10)
    );

    // Step 2: Extract the target quantity from the parsed values.
    // According to the problem structure, the second element (index 1) is the target.
    const desiredValue = parsedNumericValues[1];

    // Step 3: Isolate the list of items/components.
    // These are all values starting from the third element (index 2) onwards.
    const initialItemList = parsedNumericValues.slice(2);

    // Step 4: Sort the item list in ascending order.
    // This makes it easy to find the smallest value later.
    const orderedComponents = initialItemList.sort(
        (firstElement, secondElement) => firstElement - secondElement
    );

    // Step 5: Compute the total cost or sum of all items in the sorted list.
    // The reduce method iterates through the array, accumulating the sum.
    const cumulativeSumOfComponents = orderedComponents.reduce(
        (currentTotal, itemPrice) => currentTotal + itemPrice,
        0 // Initialize the accumulator with 0
    );

    // Step 6: Calculate the final answer.
    // This involves subtracting the cumulative sum from the desired value,
    // dividing by the cheapest component's cost (the first element of the sorted list),
    // and adding the total number of components. The result is floored to an integer.
    const finalComputedAnswer = Math.floor(
        (desiredValue - cumulativeSumOfComponents) / orderedComponents[0]
    ) + orderedComponents.length;

    // Step 7: Display the final result to the console.
    console.log(finalComputedAnswer);
}

// Main execution block:
// Reads content from standard input using Node.js's file system module,
// ensures it's interpreted as UTF-8, and then passes it to the primary processing function.
calculateResult(
    require("fs").readFileSync("/dev/stdin", "utf8")
);