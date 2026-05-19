// This function processes raw input data to find a specific minimum difference.
function ProcessInput(rawData) {
    // Split the raw input string into an array of lines.
    const inputLines = rawData.split('\n');

    // Parse the first line to get the total count of elements.
    let countElements = parseInt(inputLines[0], 10);

    // Parse the second line, split by space, and convert each part to a numeric value.
    const dataArray = inputLines[1].split(' ').map(itemValue => parseFloat(itemValue));

    // Initialize an array to store prefix sums, starting with an initial zero.
    let prefixSums = [0];

    // Calculate cumulative sums and populate the prefixSums array using a reducer.
    // The reduce method iterates through the dataArray, accumulating sums.
    dataArray.reduce((previousSum, currentValue) => {
        prefixSums.push(previousSum + currentValue); // Append the new cumulative sum to the array.
        return previousSum + currentValue; // Return the current cumulative sum for the next iteration.
    }, 0); // The initial value for the accumulator is zero.

    // Output the complete array of calculated prefix sums to the console.
    console.log(prefixSums);

    // Initialize an array to store the absolute differences between sub-array sums.
    const absoluteDifferences = [];

    // Iterate through all possible split points to divide the array into two parts.
    for (let idx = 0; idx < countElements - 1; idx++) {
        // Calculate the sum of the first part (elements from index 0 to idx-1).
        // This sum is directly available from prefixSums[idx].
        const firstPartSum = prefixSums[idx];

        // Calculate the sum of the second part (elements from index idx to countElements-1).
        // This is derived by subtracting the first part's sum from the total sum.
        // The total sum of all elements is prefixSums[countElements].
        const secondPartSum = prefixSums[countElements] - prefixSums[idx];

        // Compute the absolute difference between the two part sums and store it.
        absoluteDifferences.push(Math.abs(firstPartSum - secondPartSum));
    }

    // Output the minimum absolute difference found among all possible splits.
    console.log(Math.min(...absoluteDifferences));
}

// Read input from standard input synchronously and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
