let inputBuffer = [];
const inputReader = require('readline'); // Module for interactive terminal input

const interfaceInstance = inputReader.createInterface({
    input: process.stdin,   // Standard input stream
    output: process.stdout  // Standard output stream
}); // Initialize an interface to process input line by line

interfaceInstance.on('line', (currentLineData) => {
    // Collect each line of input into our buffer array
    inputBuffer.push(currentLineData);
});

interfaceInstance.on('close', () => {
    // This block executes once all input lines have been received and the stream closes.

    let firstInputLine = inputBuffer.shift(); // Get the very first line of input.

    // Extract problem parameters from the first input line.
    // totalElementsCount (N): The total number of values.
    const totalElementsCount = Number(firstInputLine.split(" ")[0]);
    // firstSubsetSize (A): The count of largest elements to consider for the average.
    const firstSubsetSize = Number(firstInputLine.split(" ")[1]);
    // secondSubsetSize (B): Another count parameter used in combination logic.
    const secondSubsetSize = Number(firstInputLine.split(" ")[2]);

    // Create an array to store the actual numerical data.
    let numericValues = new Array(totalElementsCount);

    // Get the second line of input, which contains space-separated numbers.
    let parsedValuesString = inputBuffer.shift().split(" ");
    // Convert string representations to actual numbers and fill the array.
    for (let elementIndex = 0; elementIndex < totalElementsCount; elementIndex++) {
        numericValues[elementIndex] = Number(parsedValuesString[elementIndex]);
    }

    // Sort the numeric values in descending order (largest to smallest).
    numericValues.sort((valA, valB) => { return (valB - valA); });

    // Initialize variables for calculating the maximum possible average.
    let maxAverageValue = 0;
    // An object (hash map) to store the frequency of each number.
    const valueCountsMap = {};

    // Iterate through the sorted numbers to sum the top 'A' elements
    // and to build the frequency map.
    for (let loopIndex = 0; loopIndex < totalElementsCount; loopIndex++) {
        // If the current element is within the top 'A' elements, add it to the sum.
        if (loopIndex < firstSubsetSize) {
            maxAverageValue += numericValues[loopIndex];
        }
        // If the number is encountered for the first time, initialize its count to 0.
        if (valueCountsMap[numericValues[loopIndex]] === undefined) {
            valueCountsMap[numericValues[loopIndex]] = 0;
        }
        // Increment the count for the current number.
        valueCountsMap[numericValues[loopIndex]]++;
    }
    // Calculate the final maximum average.
    maxAverageValue /= firstSubsetSize;
    // Output the calculated maximum average to the console.
    console.log(maxAverageValue);


    let currentCount = 0; // Tracks the count of elements processed for combinations.
    let unusedMultiplier = 1; // This variable was present in the original but seems unused. Kept for structural similarity.

    let combinationsResult = 0; // Will store the final number of combinations.

    // Determine the combination calculation path based on whether
    // the largest element is different from the B-th largest element.
    if (numericValues[0] !== numericValues[secondSubsetSize - 1]) {
        // Case 1: The top 'B' elements are not all identical.
        combinationsResult = 1; // Initialize for multiplicative accumulation.

        // Loop through the sorted numbers to calculate combinations.
        for (let mapIterationIndex = 0; mapIterationIndex < totalElementsCount; mapIterationIndex++) {
            // Check if the current number appears at least twice.
            if (valueCountsMap[numericValues[mapIterationIndex]] >= 2) {
                // Determine how many items of the current value to pick.
                // This is a conditional assignment: if condition true, use first value, else use second.
                let itemsToPick = valueCountsMap[numericValues[mapIterationIndex]] > (firstSubsetSize - currentCount)
                                ? (firstSubsetSize - currentCount)
                                : valueCountsMap[numericValues[mapIterationIndex]];

                // Multiply the running combinations result.
                combinationsResult *= calculateCombinations(valueCountsMap[numericValues[mapIterationIndex]], itemsToPick);
                // Update the count of elements considered so far.
                currentCount += valueCountsMap[numericValues[mapIterationIndex]];
                // Skip ahead in the loop if multiple identical numbers were processed.
                mapIterationIndex += valueCountsMap[numericValues[mapIterationIndex]] - 1;
            }
            else {
                // If the number appears only once, just add its count.
                currentCount += valueCountsMap[numericValues[mapIterationIndex]];
            }
        }
    }
    else {
        // Case 2: All elements from the largest down to the B-th largest are identical.
        combinationsResult = 0; // Initialize for additive accumulation.
        // Sum combinations for choosing 'choiceCount' elements from 'B' identical elements.
        for (let choiceCount = 1; choiceCount <= secondSubsetSize; choiceCount++) {
            combinationsResult += calculateCombinations(secondSubsetSize, choiceCount);
        }
    }
    // Output the total number of calculated combinations.
    console.log(combinationsResult);

}); // End of the 'close' event handler function.

/**
 * Computes the number of permutations (nPr) of selecting 'itemsToSelect' items
 * from a total of 'totalItems' distinct items.
 * @param {number} totalItems - The total number of items available (n).
 * @param {number} itemsToSelect - The number of items to select (r).
 * @returns {number} The result of nPr.
 */
function calculatePermutations(totalItems, itemsToSelect) {
    let resultProduct = 1; // Accumulator for the product.
    // Loop 'itemsToSelect' times to calculate n * (n-1) * ... * (n-r+1).
    for (let loopVar = 0; loopVar < itemsToSelect; loopVar++) {
        resultProduct *= totalItems - loopVar;
    }
    return resultProduct;
}

/**
 * Computes the number of combinations (nCr) of selecting 'elementsToChoose' items
 * from a total of 'totalElements' distinct items.
 * This is derived from permutations: nCr = nPr / rPr.
 * @param {number} totalElements - The total number of elements available (n).
 * @param {number} elementsToChoose - The number of elements to choose (r).
 * @returns {number} The result of nCr.
 */
function calculateCombinations(totalElements, elementsToChoose) {
    // Utilize the permutation function to calculate nCr.
    return calculatePermutations(totalElements, elementsToChoose) / calculatePermutations(elementsToChoose, elementsToChoose);
}