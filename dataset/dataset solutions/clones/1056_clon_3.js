const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf-8';

// Function to safely read and process input lines from a specified path.
// It includes basic error handling and input validation.
const obtainInputData = (path, encoding) => {
    try {
        const rawContent = fileSystemModule.readFileSync(path, encoding);
        const processedLines = rawContent.split('\n');
        // A minimal check to ensure there's at least a header line and a data line.
        if (processedLines.length < 2) {
            console.error("Input Error: Insufficient lines provided. Expected at least two lines.");
            // Return an array with empty strings to prevent subsequent errors
            return ["", ""];
        }
        return processedLines;
    } catch (err) {
        // Catch any file system errors during read operation.
        console.error(`File System Error: Could not read input from ${path}. Details: ${err.message}`);
        // Return an array with empty strings for graceful degradation.
        return ["", ""];
    }
};

// Global counter for tracking comparison operations during the sorting process.
// This helps in analyzing the algorithm's efficiency.
let totalComparisonOperations = 0;

// Function to merge two already sorted subarrays back into a single sorted array.
// This is a core component of the merge sort algorithm.
const integrateSortedSubarrays = (targetCollection, startIndex, middleIndex, endIndex) => {
    // Determine the sizes of the left and right partitions.
    const leftPartitionLength = middleIndex - startIndex;
    const rightPartitionLength = endIndex - middleIndex;

    // Initialize temporary arrays to hold the elements of the two partitions.
    // Using Array.from with a length property is a way to create fixed-size arrays.
    const temporaryLeftPartition = Array.from({ length: leftPartitionLength });
    const temporaryRightPartition = Array.from({ length: rightPartitionLength });

    // Populate the temporary left partition from the original array.
    // Using a while loop for iteration.
    let currentLeftSourceIndex = 0;
    while (currentLeftSourceIndex < leftPartitionLength) {
        temporaryLeftPartition[currentLeftSourceIndex] = targetCollection[startIndex + currentLeftSourceIndex];
        currentLeftSourceIndex++;
    }

    // Populate the temporary right partition from the original array.
    let currentRightSourceIndex = 0;
    while (currentRightSourceIndex < rightPartitionLength) {
        temporaryRightPartition[currentRightSourceIndex] = targetCollection[middleIndex + currentRightSourceIndex];
        currentRightSourceIndex++;
    }

    // Append a sentinel value (positive infinity) to each temporary array.
    // This technique simplifies the merging logic by eliminating the need for
    // explicit boundary checks within the main merge loop.
    temporaryLeftPartition.push(Number.POSITIVE_INFINITY);
    temporaryRightPartition.push(Number.POSITIVE_INFINITY);

    let leftReadPointer = 0;  // Pointer for traversing the temporary left array.
    let rightReadPointer = 0; // Pointer for traversing the temporary right array.

    // Iterate through the segment of the targetCollection that needs to be filled.
    for (let destinationIndex = startIndex; destinationIndex < endIndex; destinationIndex++) {
        // Each comparison contributes to the total operation count.
        totalComparisonOperations++;

        // Fetch values from the current positions of the temporary arrays.
        const valueFromLeft = temporaryLeftPartition[leftReadPointer];
        const valueFromRight = temporaryRightPartition[rightReadPointer];

        // Compare the values and place the smaller one into the targetCollection.
        // The condition is inverted compared to the original for variety.
        if (valueFromRight < valueFromLeft) {
            targetCollection[destinationIndex] = valueFromRight;
            rightReadPointer++;
        } else {
            targetCollection[destinationIndex] = valueFromLeft;
            leftReadPointer++;
        }
    }
};

// Implements the recursive divide-and-conquer strategy of the Merge Sort algorithm.
// It sorts the specified segment of the array in-place.
const performRecursiveMergeSort = (dataCollection, currentLowerBound, currentUpperBound) => {
    // Base case: If the segment contains one or zero elements, it is inherently sorted.
    // The condition `currentUpperBound - currentLowerBound <= 1` means the segment size is 1 or 0.
    if (currentUpperBound - currentLowerBound > 1) {
        // Calculate the midpoint for dividing the array.
        // This calculation method helps prevent potential integer overflow for very large bounds.
        const divisionPoint = currentLowerBound + Math.floor((currentUpperBound - currentLowerBound) / 2);

        // Recursively sort the left sub-segment.
        performRecursiveMergeSort(dataCollection, currentLowerBound, divisionPoint);
        // Recursively sort the right sub-segment.
        performRecursiveMergeSort(dataCollection, divisionPoint, currentUpperBound);

        // After both sub-segments are sorted, merge them back together.
        integrateSortedSubarrays(dataCollection, currentLowerBound, divisionPoint, currentUpperBound);
    }
};

// Helper function to parse a space-separated string of numbers into an array of actual numbers.
// Includes error handling for empty strings and non-numeric values.
const parseNumericStringIntoArray = (inputStringContent) => {
    // If the input string is empty or just whitespace, return an empty array.
    if (!inputStringContent || inputStringContent.trim() === '') {
        return [];
    }
    // Split the string by spaces, map each part to a Number, and filter out any NaN results.
    // This ensures only valid numbers are included in the final array.
    const parsedNumbers = inputStringContent.split(' ').map(Number).filter(value => !isNaN(value));
    return parsedNumbers;
};

// --- Main Program Execution ---

// Obtain all lines of input from the standard input source.
const inputLinesReceived = obtainInputData(standardInputPath, encodingType);

// The second line (index 1) is expected to contain the sequence of numbers to sort.
// Provide a default empty string if the line doesn't exist to prevent errors.
const rawNumbersSequence = inputLinesReceived[1] || '';

// Parse the raw string of numbers into a usable array of numeric values.
let numericalDataSet = parseNumericStringIntoArray(rawNumbersSequence);

// Perform an initial validation on the parsed dataset.
if (numericalDataSet.length === 0) {
    // If no valid numbers were found, log a warning and exit gracefully.
    console.warn("Processing Warning: No valid numerical data was found for sorting. Program will terminate.");
} else {
    // Execute the merge sort algorithm on the prepared dataset.
    // The sorting is performed in-place, modifying `numericalDataSet` directly.
    performRecursiveMergeSort(numericalDataSet, 0, numericalDataSet.length);

    // Output the final sorted sequence of numbers, joined by spaces.
    console.log(numericalDataSet.join(' '));

    // Output the total count of comparison operations performed.
    // This metric can be used to evaluate the algorithm's performance.
    console.log(`Comparison Operations Count: ${totalComparisonOperations}`);
}