function processInput(rawData) {
    // The first line of the input contains the total number of elements.
    var totalElements = rawData.split("\n")[0];
    // The second line contains the space-separated values.
    var valueString = rawData.split("\n")[1];
    // Convert the string of values into an array of strings.
    var elementArray = valueString.split(" ");

    // Initialize objects to store frequency counts for elements at even and odd indices.
    var evenPositionCounts = {}; // Stores counts for elements at indices 1, 3, 5...
    var oddPositionCounts = {};  // Stores counts for elements at indices 0, 2, 4...

    // A flag to track if all elements in the original sequence are identical.
    var allValuesIdentical = true;

    // Iterate through half of the array, processing two elements per loop cycle.
    // This loop runs 'totalElements / 2' times.
    for (var idx = 0; idx < totalElements / 2; idx++) {
        // Get the element at the current odd position (0, 2, 4, ...).
        // Increment its count in the odd positions map.
        oddPositionCounts[elementArray[idx * 2]] = (oddPositionCounts[elementArray[idx * 2]] || 0) + 1;

        // Get the element at the current even position (1, 3, 5, ...).
        // Increment its count in the even positions map.
        evenPositionCounts[elementArray[idx * 2 + 1]] = (evenPositionCounts[elementArray[idx * 2 + 1]] || 0) + 1;

        // Check if the elements at the current odd and even positions are different.
        // If they are, and the flag is still true, set it to false.
        if (allValuesIdentical && (elementArray[idx * 2] != elementArray[idx * 2 + 1])) {
            allValuesIdentical = false;
        }
    }

    // If all elements in the original sequence were found to be identical,
    // the minimum operations needed is half the total elements.
    if (allValuesIdentical) {
        return totalElements / 2;
    }

    // Otherwise, calculate the sum of mismatches from both frequency maps.
    // This represents the minimum operations needed to make the odd and even positioned elements distinct.
    return calculateMismatches(oddPositionCounts) + calculateMismatches(evenPositionCounts);
}

// This helper function computes the total count of elements in a map that are not the most frequent one.
function calculateMismatches(frequencyMap) {
    // Determine the key that has the highest frequency in the provided map.
    var maxFrequencyValue = findMostFrequentKey(frequencyMap);
    var mismatchCount = 0; // Initialize a counter for elements that are not the most frequent.

    // Iterate over each key (number string) in the frequency map.
    for (var currentKey in frequencyMap) {
        // If the current key is not the most frequent one,
        // add its frequency to the mismatch count.
        if (currentKey != maxFrequencyValue) {
            mismatchCount += frequencyMap[currentKey];
        }
    }
    return mismatchCount; // Return the accumulated count of mismatches.
}

// This helper function finds the key associated with the highest frequency in a given map.
function findMostFrequentKey(dataMap) {
    var highestCount = 0; // Tracks the maximum frequency encountered.
    var keyWithHighestCount = -1; // Stores the key corresponding to the highest frequency.

    // Iterate through all keys present in the data map.
    Object.keys(dataMap).forEach(function (entryKey) {
        // If the frequency of the current key is greater than the current highest count,
        if (dataMap[entryKey] > highestCount) {
            highestCount = dataMap[entryKey]; // Update the highest count.
            keyWithHighestCount = entryKey;   // Update the key with the highest count.
        }
    });
    return keyWithHighestCount; // Return the key that appeared most often.
}

// Read the input from standard input, process it using the main function, and print the result.
console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));
