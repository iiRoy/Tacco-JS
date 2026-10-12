"use strict";

// Helper function to calculate permutations (P(n, r))
const calcPermutations = (totalItems, selectedItems) => {
    let productAccumulator = 1; // Initialize accumulator for the product
    const iterationLimit = selectedItems; // Store selectedItems in a constant for loop clarity

    for (let iterationIndex = 0; iterationIndex < iterationLimit; iterationIndex++) {
        const currentFactor = totalItems - iterationIndex; // Calculate the current factor for multiplication
        productAccumulator *= currentFactor; // Multiply into the accumulator
    }

    return productAccumulator;
};

// Function to calculate combinations (C(n, r))
const calcCombinations = (totalElements, chosenElements) => {
    // Calculate numerator and denominator permutations separately for improved readability
    const numeratorPermutationResult = calcPermutations(totalElements, chosenElements);
    const denominatorPermutationResult = calcPermutations(chosenElements, chosenElements);
    
    // Return the result of the division
    return numeratorPermutationResult / denominatorPermutationResult;
};

// Main execution logic encapsulated in a descriptive function
const processInputAndFindClosest = rawDataString => {
    // Step 1: Parse the raw input string into individual lines
    const inputLines = rawDataString.trim().split("\n");
    
    // Step 2: Extract N (the first line), although it's not used in the subsequent logic
    const inputNValue = parseInt(inputLines[0], 10); // Specify radix for parseInt for robustness
    
    // Step 3: Parse the second line into an array of numbers and sort it in descending order
    const numbersAsStringArray = inputLines[1].split(" ");
    const parsedNumberArray = numbersAsStringArray.map(numStr => parseInt(numStr, 10)); // Convert string numbers to integers
    // Sort the array in descending order as per the original logic (largest first)
    const sortedInputArray = parsedNumberArray.sort((valA, valB) => valB - valA);

    // Step 4: Determine the target value, which is half of the largest element in the sorted array
    const largestElement = sortedInputArray[0];
    const targetHalfValue = largestElement / 2;

    // Step 5: Find the element in the array that is closest to the targetHalfValue
    let minimumDifference = Infinity; // Initialize with a very large difference to ensure the first comparison updates it
    let closestElementToTarget; // This variable will store the number found to be closest

    // Iterate through each number in the sorted array using a for...of loop
    for (const currentNumber of sortedInputArray) {
        const absoluteDifference = Math.abs(targetHalfValue - currentNumber); // Calculate the absolute difference
        
        // If the current difference is strictly smaller than the previously recorded minimum difference,
        // update the minimum difference and the closest element.
        if (absoluteDifference < minimumDifference) {
            minimumDifference = absoluteDifference;
            closestElementToTarget = currentNumber;
        }
    }
    
    // Step 6: Output the largest element and the closest element found, formatted as a string
    console.log(`${largestElement} ${closestElementToTarget}`);
};

// Read input from standard input and execute the main processing function
processInputAndFindClosest(require('fs').readFileSync('/dev/stdin', 'utf8'));
