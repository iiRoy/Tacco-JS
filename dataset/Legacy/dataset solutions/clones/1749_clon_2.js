const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineData = fileContent.split('\n');

const initialArrayLength = +lineData.shift();
let currentNumbers = lineData.shift().split(' ').map(function(numericString) {
    return (+numericString);
});

const numberOfQueries = +lineData.shift();
lineData.pop();

/**
 * A simple reducer function to accumulate the sum of numbers.
 * @param {number} accumulatorValue - The running total.
 * @param {number} currentElement - The number to add to the total.
 * @returns {number} The updated sum.
 */
function reducerFunction(accumulatorValue, currentElement) {
    accumulatorValue += currentElement;
    return accumulatorValue;
}

/**
 * A mapping function that replaces a specific value with another.
 * It relies on 'valueToFind' and 'valueToInsert' being available in its scope.
 * @param {number} itemToMap - The current number being processed.
 * @returns {number} The replacement value if a match is found, otherwise the original item.
 */
function replacementMapper(itemToMap) {
    if (itemToMap === valueToFind) {
        return valueToInsert;
    } else {
        return itemToMap;
    }
}

let totalSum = 0;

// Process each query one by one.
for (let queryIteration = 0; queryIteration < numberOfQueries; queryIteration++) {
    const queryOperation = lineData[queryIteration].split(' ');

    // These variables are declared with 'var' and are thus hoisted to the global scope,
    // making them accessible to the 'replacementMapper' function.
    var valueToFind = (+queryOperation[0]) | 0;
    var valueToInsert = (+queryOperation[1]) | 0;

    // Optimization: If the current sum is positive and the value to find is not present in the array,
    // the array (and thus its sum) will not change.
    if (totalSum > 0 && currentNumbers.indexOf(valueToFind) === -1) {
        console.log(totalSum);
        continue;
    }

    // Apply the replacement logic to the array elements.
    currentNumbers = currentNumbers.map(replacementMapper);

    // Recalculate the total sum of the modified array.
    totalSum = currentNumbers.reduce(reducerFunction, 0);

    console.log(totalSum);
}
