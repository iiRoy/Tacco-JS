process.stdin.resume();
process.stdin.setEncoding('utf8');

/*
 * This script processes input data to perform an insertion sort.
 * It reads the number of elements and the elements themselves from standard input.
 */
function processData (rawData) {
    // Clean up the input string and split it into lines
    rawData = rawData.trim().split('\n');

    // Extract the total number of items
    var elementCount = Number(rawData[0]);
    // Parse the array of numbers
    var dataArray = rawData[1].split(' ').map(Number);

    /*
     * The core sorting logic: Insertion Sort
     * Iterates through the array, inserting each element into its correct position
     * within the already sorted part of the array.
     */
    for (var currentIdx = 1; currentIdx < elementCount; currentIdx++) {
        // Output the current state of the array before processing the next element
        console.log(dataArray.join(' '));

        // Store the value to be inserted
        var currentValue = dataArray[currentIdx];
        // Initialize the index for comparison in the sorted part
        var comparisonIdx = currentIdx - 1;

        // Shift elements greater than currentValue to the right
        while (comparisonIdx >= 0 && dataArray[comparisonIdx] > currentValue) {
            dataArray[comparisonIdx + 1] = dataArray[comparisonIdx];
            comparisonIdx--;
        }

        // Place currentValue in its correct sorted position
        dataArray[comparisonIdx + 1] = currentValue;
    }

    // Output the final sorted array
    console.log(dataArray.join(' '));
}

// Read all input from /dev/stdin and pass it to the processing function
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
