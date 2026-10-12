function processInput(rawInputData) {
    // Trim leading/trailing whitespace and split the input into lines.
    const parsedLines = rawInputData.trim().split('\n');

    // The first line contains the count of elements.
    const elementCount = Number(parsedLines.shift());

    // The second line contains the space-separated numbers, convert them to an array of numbers.
    const dataArray = parsedLines.shift().split(' ').map(Number);

    // Initialize an array to hold the inversion count. Using an array allows pass-by-reference.
    let inversionCounter = [0];

    // Perform the merge sort operation, which also counts inversions.
    sortAndCountInversions(dataArray, 0, elementCount, inversionCounter);

    // Output the total inversion count.
    console.log(inversionCounter[0]);
}

/**
 * Recursively sorts a sub-array and counts inversions using a merge sort approach.
 * @param {number[]} targetCollection - The array to be sorted.
 * @param {number} startIndex - The starting index of the current sub-array.
 * @param {number} endIndex - The ending index (exclusive) of the current sub-array.
 * @param {number[]} inversionCounter - An array containing the total inversion count.
 */
function sortAndCountInversions(targetCollection, startIndex, endIndex, inversionCounter) {
    // Base case for recursion: if the sub-array has 0 or 1 element, it's already sorted.
    if (startIndex + 1 < endIndex) {
        // Calculate the middle index to split the array.
        const middleIndex = Math.ceil((startIndex + endIndex) / 2);

        // Recursively sort the left half.
        sortAndCountInversions(targetCollection, startIndex, middleIndex, inversionCounter);
        // Recursively sort the right half.
        sortAndCountInversions(targetCollection, middleIndex, endIndex, inversionCounter);

        // Merge the two sorted halves and count inversions between them.
        combineAndTally(targetCollection, startIndex, middleIndex, endIndex, inversionCounter);
    }
}

/**
 * Merges two sorted sub-arrays into a single sorted array and updates the inversion count.
 * @param {number[]} targetCollection - The main array containing the sub-arrays.
 * @param {number} startIndex - The starting index of the left sub-array.
 * @param {number} middleIndex - The ending index (exclusive) of the left sub-array, and starting index of the right.
 * @param {number} endIndex - The ending index (exclusive) of the right sub-array.
 * @param {number[]} inversionCounter - An array containing the total inversion count.
 */
function combineAndTally(targetCollection, startIndex, middleIndex, endIndex, inversionCounter) {
    // Create temporary arrays for the left and right halves.
    const leftSubArray = targetCollection.slice(startIndex, middleIndex);
    const rightSubArray = targetCollection.slice(middleIndex, endIndex);

    // Add sentinels (Infinity) to simplify comparison logic and avoid out-of-bounds checks.
    leftSubArray.push(Infinity);
    rightSubArray.push(Infinity);

    // Pointers for iterating through the temporary sub-arrays.
    let leftPointer = 0;
    let rightPointer = 0;

    // Iterate through the original array's segment to place sorted elements.
    for (let currentPosition = startIndex, loopLimit = endIndex; currentPosition < loopLimit; currentPosition++) {
        // Compare elements from the left and right sub-arrays.
        if (leftSubArray[leftPointer] <= rightSubArray[rightPointer]) {
            // If the left element is smaller or equal, place it in the main array.
            targetCollection[currentPosition] = leftSubArray[leftPointer];
            leftPointer++; // Move to the next element in the left sub-array.
        } else {
            // If the right element is smaller, place it in the main array.
            targetCollection[currentPosition] = rightSubArray[rightPointer];
            rightPointer++; // Move to the next element in the right sub-array.

            // When an element from the right sub-array is chosen, it means all remaining
            // elements in the left sub-array (from current leftPointer onwards) are
            // greater than the chosen right element, thus forming inversions.
            inversionCounter[0] += middleIndex - startIndex - leftPointer;
        }
    }
}

// Read input from standard input and execute the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
