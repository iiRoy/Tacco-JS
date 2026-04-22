"use strict";

const processInputData = (rawTextContent) => {
    const contentLines = rawTextContent.trim().split('\n');
    const numericElementsString = contentLines[1];
    
    // Convert string numbers to actual numbers and sort them in ascending order
    const sortedNumericValues = numericElementsString.split(' ').map(Number).sort((valueA, valueB) => valueA - valueB);

    // Identify all numbers that are the first element of an adjacent pair
    // This creates an array similar to the 'pairNums' in the original, including duplicates if they form multiple pairs
    const identifiedPairStarters = sortedNumericValues.reduce((accumulatorForPairs, currentElement, currentIndex, fullArray) => {
        if (currentIndex < fullArray.length - 1 && currentElement === fullArray[currentIndex + 1]) {
            accumulatorForPairs.push(currentElement);
        }
        return accumulatorForPairs;
    }, []);

    // Extract unique values from the identified pairs and sort them in descending order
    const uniqueDescendingPairValues = [...new Set(identifiedPairStarters)].sort((valueA, valueB) => valueB - valueA);

    let finalComputationResult = 0;

    if (uniqueDescendingPairValues.length === 1) {
        // If there's only one distinct number that forms a pair, square it
        finalComputationResult = uniqueDescendingPairValues[0] * uniqueDescendingPairValues[0];
    } else if (uniqueDescendingPairValues.length >= 2) {
        // If there are two or more distinct numbers that form pairs, multiply the two largest
        finalComputationResult = uniqueDescendingPairValues[0] * uniqueDescendingPairValues[1];
    }
    // If uniqueDescendingPairValues.length is 0, finalComputationResult remains 0, which is the correct outcome.

    console.log(finalComputationResult);
};

// Invoke the processing function with input read from stdin
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));