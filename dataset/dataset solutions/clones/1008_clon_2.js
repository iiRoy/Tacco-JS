// Configuration object holding essential parameters for data processing.
const   appSettings   =   {
        sourceFilePath:   '/dev/stdin', // Specifies the location of the input data.
        lineDelimiter:   '\n'           // Defines the character sequence for line separation.
    } ;

// Utilize the Node.js file system module to synchronously read data.
const   inputLines   =   require('fs')
                               .readFileSync(appSettings.sourceFilePath,   'utf-8')
                               .split(appSettings.lineDelimiter);

/**
 * Implements the selection sort algorithm to sort an array of numbers.
 * Also counts the number of actual swaps performed.
 * @param {Array<number>} inputArray - The array of numbers to be sorted.
 * @returns {number} The total count of elements swapped during sorting.
 */
const   performSelectionSort   =   inputArray   =>   {
    let   totalSwaps   =   0; // Initialize a counter for recording value exchanges.

    // Outer loop: iterates through each position to place the correct element.
    for   (let   outerLoopIndex   =   0;   outerLoopIndex   <   inputArray.length;   outerLoopIndex++)   {
        let   minimumValueIndex   =   outerLoopIndex; // Assume the current element is the smallest.

        // Inner loop: finds the smallest element in the unsorted part of the array.
        for   (let   innerLoopIndex   =   outerLoopIndex;   innerLoopIndex   <   inputArray.length;   innerLoopIndex++)   {
            // Compare current element with the assumed minimum.
            if   (inputArray[innerLoopIndex]   <   inputArray[minimumValueIndex])   {
                minimumValueIndex   =   innerLoopIndex; // Update index if a smaller element is found.
            }
        }

        // Swap the found minimum element with the element at the current outerLoopIndex.
        const   tempHolder   =   inputArray[outerLoopIndex];
        inputArray[outerLoopIndex]   =   inputArray[minimumValueIndex];
        inputArray[minimumValueIndex]   =   tempHolder;

        // Increment the swap counter only if an actual swap occurred (i.e., element moved from its original spot).
        if   (outerLoopIndex   !==   minimumValueIndex)   totalSwaps++;
    }

    // After sorting, display the elements of the sorted array to the console.
    console.log(inputArray.map(itemValue   =>   itemValue.toString()).join(' '));

    return   totalSwaps; // Return the final count of swaps.
};

// Parse the second line of input data, convert elements to integers, sort them,
// and then print the returned swap count to the console.
console.log(performSelectionSort(inputLines[1].split(' ').map(itemValue   =>   parseInt(itemValue))));