/* This script processes numerical input to perform a specific sequence of subtractions.
 * It aims to reduce a collection of numbers into a final single value
 * while logging the intermediate operations. */
console.log(( (inputData) => { // Primary execution block accepting raw input.

    // Parse the incoming text data: first line for count, subsequent lines for values.
    // The input is trimmed, split by newlines, and each line is further segmented by spaces.
    // All string values are converted into integers.
    const [ [itemCount], valueArray ] = inputData
        .trim() // Erase leading/trailing whitespace.
        .split('\n') // Divide into individual lines.
        .map( (lineOfText) => lineOfText.split(' ').map( (stringValue) => Number(stringValue) ) );

    // Arrange the numerical collection in descending order.
    // This sorting step is crucial for the subsequent logic.
    valueArray.sort( (elemA, elemB) => elemB - elemA );

    // Initialize pointers for a segmenting process.
    // This part effectively performs a modified binary search to find a split point.
    let lowIndex = 0;
    let highIndex = itemCount - 1; // 'highIndex' now refers to 'r' from original code.

    // Continue narrowing down the range until the pointers are adjacent.
    while ( highIndex - lowIndex > 1 ) {
        // Calculate the midpoint using integer division to ensure it's a valid index.
        const middleIndex = lowIndex + ( (highIndex - lowIndex) / 2 ) | 0;

        // Decision logic based on the value at the midpoint.
        // If the element is negative, adjust the 'highIndex'; otherwise, adjust 'lowIndex'.
        if ( valueArray[middleIndex] < 0 ) {
            highIndex = middleIndex; // Move high pointer.
        } else {
            lowIndex = middleIndex;  // Move low pointer.
        }
    }

    // Prepare a list to record all performed operations.
    const operationSteps = [];

    // Initialize two key values from the sorted array.
    // 'principalValue' takes the largest number, 'auxiliaryValue' takes the smallest.
    let principalValue = valueArray[0];
    let auxiliaryValue = valueArray[valueArray.length - 1];

    // Create two sub-segments from the main array.
    // 'firstSegment' contains elements from index 1 up to 'highIndex' (exclusive).
    // 'secondSegment' contains elements from 'highIndex' up to the second-to-last element.
    const firstSegment = valueArray.slice(1, highIndex);
    const secondSegment = valueArray.slice(highIndex, valueArray.length - 1);

    // Process the first segment: iteratively subtract elements from 'auxiliaryValue'.
    // Elements are processed from right to left (LIFO due to pop).
    while ( firstSegment.length ) {
        const currentFirstItem = firstSegment.pop(); // Retrieve the next element.
        operationSteps.push(`${auxiliaryValue} ${currentFirstItem}`); // Log the operation.
        auxiliaryValue -= currentFirstItem; // Update 'auxiliaryValue'.
    }

    // Perform a crucial intermediate operation: subtract 'auxiliaryValue' from 'principalValue'.
    operationSteps.push(`${principalValue} ${auxiliaryValue}`); // Log this specific step.
    principalValue -= auxiliaryValue; // Update 'principalValue'.

    // Process the second segment: iteratively subtract elements from 'principalValue'.
    // Elements are again processed from right to left.
    while ( secondSegment.length ) {
        const currentSecondItem = secondSegment.pop(); // Get the next element.
        operationSteps.push(`${principalValue} ${currentSecondItem}`); // Log the operation.
        principalValue -= currentSecondItem; // Update 'principalValue'.
    }

    // Construct the final output string: the final 'principalValue' followed by all recorded operations.
    return `${principalValue}\n` + operationSteps.join('\n');

// The input data is read synchronously from standard input using Node.js 'fs' module.
} )( require('fs').readFileSync('/dev/stdin', 'utf8') ) );