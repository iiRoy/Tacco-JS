const inputLines = [];
const ioModule = require('readline');

const inputInterface = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Helper function to compute the absolute difference between two numeric values.
const getAbsoluteDifference = (valA, valB) => Math.abs(valA - valB);

// Helper function to calculate the sum of absolute differences between adjacent elements in an array.
const calculateTotalDistance = (arr) => {
    let currentTotal = 0;
    // Iterate from the second element to the end, comparing each with its predecessor.
    for (let j = 1; j < arr.length; j++) {
        currentTotal += getAbsoluteDifference(arr[j], arr[j - 1]);
    }
    return currentTotal;
};

inputInterface.on('line', (currentLine) => {
    inputLines.push(currentLine);
});

inputInterface.on('close', () => {
    const ZERO_PAD_VALUE = 0; // Define a constant for the padding value.
    const elementCount = parseInt(inputLines[0], 10); // Parse the number of elements from the first line.
    
    // Parse the second line, splitting by space and converting each part to an integer.
    const originalValues = inputLines[1].split(" ").map(valStr => parseInt(valStr, 10));

    // Construct a new array by adding the padding value to the beginning and end of the original values.
    // This avoids in-place modification of the original array.
    const paddedValues = [ZERO_PAD_VALUE, ...originalValues, ZERO_PAD_VALUE];

    // Calculate the initial cumulative distance for the padded array using the helper function.
    const cumulativeDistance = calculateTotalDistance(paddedValues);

    // Iterate through each element of the original sequence (corresponding to indices 1 to elementCount in paddedValues).
    for (let index = 1; index <= elementCount; index++) {
        // Retrieve the values of the element being considered and its immediate neighbors from the padded array.
        const previousElementValue = paddedValues[index - 1];
        const currentElementValue = paddedValues[index];
        const nextElementValue = paddedValues[index + 1];

        // Calculate the two segments of distance that would be removed if the current element were skipped.
        const distanceBeforeCurrent = getAbsoluteDifference(currentElementValue, previousElementValue);
        const distanceAfterCurrent = getAbsoluteDifference(nextElementValue, currentElementValue);
        const totalDistancesToRemove = distanceBeforeCurrent + distanceAfterCurrent;

        // Calculate the new single segment of distance that would connect the previous and next elements directly.
        const newDirectDistance = getAbsoluteDifference(previousElementValue, nextElementValue);

        // Compute the modified total distance by adjusting the initial cumulative distance.
        const modifiedDistance = cumulativeDistance - totalDistancesToRemove + newDirectDistance;
        
        console.log(modifiedDistance);
    }
});
