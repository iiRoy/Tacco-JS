function ProcessInput(rawData) {
    // The input string is first split by newline characters to separate lines of data.
    rawData = rawData.split('\n');

    // The first line is expected to contain a single number, which represents the total count of elements.
    // It's split by space and then each part is converted to a number.
    // In typical competitive programming scenarios, this often results in an array like [N].
    var numElements = rawData[0].split(' ').map(Number);

    // The second line contains the actual array of numbers, also space-separated.
    var dataArray = rawData[1].split(' ').map(Number);

    // Initialize a counter to keep track of subarrays where sum equals XOR.
    let resultCounter = 0;

    // Outer loop iterates through each possible starting point of a subarray.
    // It goes up to `numElements - 1` because the inner loop needs at least one element after `outerIndex`.
    for (let outerIndex = 0; outerIndex < numElements - 1; outerIndex++) {
        // Initialize the running sum and XOR for the current subarray, starting with the element at `outerIndex`.
        let currentSum = dataArray[outerIndex];
        let currentXor = dataArray[outerIndex];

        // Inner loop extends the subarray from `outerIndex + 1` to the end of the `dataArray`.
        for (let innerIndex = outerIndex + 1; innerIndex < numElements; innerIndex++) {
            // Add the next element to the running sum.
            currentSum += dataArray[innerIndex];
            // XOR the next element with the running XOR.
            currentXor ^= dataArray[innerIndex];

            // If the current sum of the subarray equals its current XOR, increment the result counter.
            if (currentSum === currentXor) {
                resultCounter++;
            }
        }
    }

    // Output the final calculated value.
    // The problem statement requires adding the total number of elements (`numElements`) to the `resultCounter`.
    console.log(resultCounter + numElements);
}
