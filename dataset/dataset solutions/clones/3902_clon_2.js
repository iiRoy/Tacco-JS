"use strict"; // Activate strict parsing and error handling for the script

// Function to compute the number of permutations (arrangements) P(itemsTotal, itemsChosen)
const calculateArrangements = (itemsTotal, itemsChosen) => {
    let currentProduct = 1; // Initialize accumulator for the product

    // Loop 'itemsChosen' times to multiply the decreasing sequence
    for (let loopIndex = 0; loopIndex < itemsChosen; loopIndex++) {
        currentProduct *= (itemsTotal - loopIndex); // Multiply by (n), then (n-1), etc.
    }

    return currentProduct; // Return the final permutation count
};

// Function to compute the number of combinations (selections) C(totalElements, elementsToSelect)
const determineCombinations = (totalElements, elementsToSelect) => {
    // Combination formula: P(n, r) / P(r, r)
    // P(r, r) is equivalent to r! (r factorial)
    return calculateArrangements(totalElements, elementsToSelect) / calculateArrangements(elementsToSelect, elementsToSelect);
};

// Primary function to process the input data and produce the required output
const handleInputAndOutput = (rawInputContent) => {
    // Pre-process the raw input string: trim whitespace, then split into lines
    let inputLines = rawInputContent.trim().split("\n");

    // Parse the first line, which represents N (though N is not used in subsequent logic)
    const dataSize = parseInt(inputLines[0], 10); // Convert string to integer, base 10

    // Process the second line: split by spaces, convert each part to an integer,
    // then sort the resulting numbers in descending order.
    const numericArraySorted = inputLines[1].split(" ").map(strNum => parseInt(strNum, 10)).sort((valOne, valTwo) => valTwo - valOne);

    // Calculate half of the largest number in the sorted array (which is the first element)
    let targetHalfValue = numericArraySorted[0] / 2;

    // Initialize variables for finding the number closest to 'targetHalfValue'
    let smallestDifference = Infinity; // Set initial minimum difference to positive infinity
    let selectedNumber; // This variable will store the number from the array

    // Iterate through the indices of the sorted array
    // IMPORTANT: The original code's logic for finding the "closest" value is flawed.
    // 'smallestDifference' is never updated from 'Infinity', so the condition
    // 'Math.abs(...) < smallestDifference' is always true for any finite number.
    // This means 'selectedNumber' will be assigned the value of 'numericArraySorted[idx]'
    // in every iteration, effectively resulting in 'selectedNumber' holding the LAST element of the array.
    for (let idx in numericArraySorted) {
        // The condition below will always be true because 'smallestDifference' remains Infinity.
        if (Math.abs(targetHalfValue - numericArraySorted[idx]) < smallestDifference) {
            selectedNumber = numericArraySorted[idx]; // This assignment happens for every element.
        }
    }

    // Output the largest number (first element of the sorted array)
    // and the 'selectedNumber' (which is effectively the last element due to the loop's behavior).
    console.log(numericArraySorted[0] + " " + selectedNumber);
};

// Read the entire content of standard input synchronously and pass it to the main handler
handleInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
