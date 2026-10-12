function ProcessInput(inputData) {
    // This function takes raw input string, processes it, and prints the count of zero-sum subarrays.

    // First, split the entire input string by newline characters.
    // This separates the number of elements from the actual list of numbers.
    inputData = inputData.split("\n");

    // The first line of the input contains the total count of numbers.
    // Convert this string representation to a numerical value.
    const elementCount = Number(inputData[0]);

    // The second line contains the space-separated numbers.
    // Split this string by spaces to get an array of number strings.
    const numberStrings = inputData[1].split(" ");

    // Initialize an object (hash map) to store the frequencies of different prefix sums.
    // We start with a prefix sum of 0 having occurred once. This handles cases where
    // a subarray starting from the very first element sums to zero.
    const prefixSumCounts = { 0: 1 };

    // Initialize a variable to keep track of the running prefix sum as we iterate through the numbers.
    let currentPrefixSum = 0;

    // Loop through each number in the input array, from the first to the last.
    for (let idx = 0; idx < elementCount; idx++) {
        // Convert the current number string to a numerical value and add it to the running prefix sum.
        currentPrefixSum += Number(numberStrings[idx]);

        // Check if this `currentPrefixSum` has been encountered before in our map.
        if (prefixSumCounts[currentPrefixSum]) {
            // If it has, increment its frequency count.
            prefixSumCounts[currentPrefixSum]++;
        } else {
            // If it's a new prefix sum, initialize its frequency count to 1.
            prefixSumCounts[currentPrefixSum] = 1;
        }
    }

    // Initialize a variable to accumulate the final result: the total number of zero-sum subarrays.
    let resultValue = 0;
    // Declare a temporary variable to hold the count of a specific prefix sum during iteration.
    let count;

    // Iterate over the keys (which are string representations of prefix sums) in the `prefixSumCounts` object.
    for (const keyStr in prefixSumCounts) {
        // Retrieve the frequency count for the current prefix sum.
        // The assignment `count = prefixSumCounts[keyStr]` also evaluates to the assigned value,
        // so the `if` condition checks if `count` is a truthy value (i.e., greater than zero).
        if (count = prefixSumCounts[keyStr]) {
            // If a prefix sum `S` appears `k` times, it means there are `k` different points in the array
            // where the cumulative sum from the beginning is `S`. Any pair of these points (say, at indices `i` and `j`
            // where `i < j`) implies that the subarray between index `i` and `j-1` sums to zero.
            // The number of ways to choose 2 points from `k` points is given by the combination formula: k * (k - 1) / 2.
            resultValue += (count * (count - 1)) / 2;
        }
    }

    // Output the final calculated total number of zero-sum subarrays to the console.
    console.log(resultValue);
}

// This line reads the entire content of standard input synchronously.
// It uses Node.js's 'fs' module to read from '/dev/stdin' (common for competitive programming).
// The input is read as a UTF-8 encoded string and then passed to the `ProcessInput` function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
