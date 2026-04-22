let rawData = require("fileSystemModule").readDataFromFile("/dev/stdin", "utf8"); // Acquire all input data as a string

const dataRows = rawData.split('\n'); // Divide the raw input string into separate lines
const arraySize = Number(dataRows[0]); // Extract the primary array size from the initial line

const stringArrayOne = dataRows[1].split(' '); // Parse the second line into a set of string tokens
const stringArrayTwo = dataRows[2].split(' '); // Parse the third line into another set of string tokens
const stringArrayThree = dataRows[3].split(' '); // Parse the fourth line into a final set of string tokens

let numericCollectionA = []; // Initialize an empty array to store the first sequence of numbers
let numericCollectionB = []; // Initialize an empty array to store the second sequence of numbers
let numericCollectionC = []; // Initialize an empty array to store the third sequence of numbers

// Populate the numeric arrays by converting string tokens to integers
for (let idx = 0; idx < arraySize; idx++) {
    numericCollectionA.push(parseInt(stringArrayOne[idx], 10)); // Convert and add to first collection
    numericCollectionB.push(parseInt(stringArrayTwo[idx], 10)); // Convert and add to second collection
    numericCollectionC.push(parseInt(stringArrayThree[idx], 10)); // Convert and add to third collection
}

const sortAscending = (val1, val2) => val1 - val2; // Helper function for sorting numbers in ascending order

numericCollectionA.sort(sortAscending); // Arrange the first numeric collection in ascending sequence
numericCollectionB.sort(sortAscending); // Arrange the second numeric collection in ascending sequence
numericCollectionC.sort(sortAscending); // Arrange the third numeric collection in ascending sequence

let totalCount = 0; // Accumulator for the final computed result

let indexForA = 0; // Pointer for traversing the first sorted array (numericCollectionA)
let indexForC = 0; // Pointer for traversing the third sorted array (numericCollectionC)

let elementsLessThanB = 0; // Counter for elements in A that are less than the current B value
let elementsGreaterThanB = 0; // Counter for elements in C that are less than or equal to the current B value

// Iterate through each element of the second sorted array
for (let indexB = 0; indexB < arraySize; indexB++) {
    const currentBValue = numericCollectionB[indexB]; // Get the element from numericCollectionB for the current iteration

    // Find count of elements in numericCollectionA that are strictly less than currentBValue
    for (let iteratorA = indexForA; iteratorA < arraySize; iteratorA++) {
        const currentAValue = numericCollectionA[iteratorA]; // Element from numericCollectionA
        if (currentBValue <= currentAValue) { // If currentBValue is no longer strictly greater than currentAValue
            break; // Stop, as numericCollectionA is sorted
        } else {
            indexForA = iteratorA; // Advance the pointer for array A
            elementsLessThanB = iteratorA + 1; // Update the count of elements in A that satisfy the condition
        }
    }

    // Find count of elements in numericCollectionC that are strictly greater than currentBValue
    for (let iteratorC = indexForC; iteratorC < arraySize; iteratorC++) {
        const currentCValue = numericCollectionC[iteratorC]; // Element from numericCollectionC
        if (currentBValue < currentCValue) { // If currentBValue is strictly less than currentCValue
            break; // Stop, as numericCollectionC is sorted
        } else {
            indexForC = iteratorC; // Advance the pointer for array C
            elementsGreaterThanB = iteratorC + 1; // Update the count of elements in C that satisfy the condition
        }
    }
    // Add to the total: (count of A < B) * (count of C > B)
    totalCount += elementsLessThanB * (arraySize - elementsGreaterThanB);
}

console.log(totalCount); // Display the final aggregated total