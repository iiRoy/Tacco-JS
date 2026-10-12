function ProcessInput(inputData) {
    // Split the incoming data by newline characters to separate lines.
    inputData = inputData.split("\n");

    // Convert the first line to a number, representing the total count of elements.
    let countElements = +inputData[0];

    // Split the second line by spaces to obtain an array of string representations of numbers.
    let elementStrings = inputData[1].split(" ");

    // Initialize a hash map to store the occurrences of each prefix sum.
    // The sum of zero is considered to have occurred once before processing any elements.
    let sumOccurrences = { 0: 1 };

    // Initialize a variable to keep track of the running prefix sum.
    let currentPrefixSum = 0;

    // Iterate through each element in the array of element strings.
    for (let elementIndex = 0; elementIndex < countElements; elementIndex++) {
        // Add the numeric value of the current element to the running prefix sum.
        currentPrefixSum += +elementStrings[elementIndex];

        // Update the count for the current prefix sum in the hash map.
        // If the sum has been encountered before, increment its count; otherwise, set it to one.
        if (sumOccurrences[currentPrefixSum]) {
            sumOccurrences[currentPrefixSum]++;
        } else {
            sumOccurrences[currentPrefixSum] = 1;
        }
    }

    // Initialize the final tally for the number of pairs.
    let finalTally = 0, temporaryValue;

    // Iterate over the keys (which are the prefix sums) in the sum occurrences map.
    for (let sumKey in sumOccurrences) {
        // Retrieve the frequency of the current prefix sum.
        // If the frequency is non-zero (which it will be for any existing key),
        // calculate the number of pairs that can be formed from this frequency.
        if (temporaryValue = sumOccurrences[sumKey]) {
            // The formula n * (n - 1) / 2 calculates the number of unique pairs from 'n' items.
            finalTally += temporaryValue * (temporaryValue - 1) / 2;
        }
    }

    // Print the computed final tally to the console.
    console.log(finalTally);
}

// Read the entire content of standard input synchronously using Node.js file system module,
// then invoke the processing function with the obtained data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
