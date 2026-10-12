frequencyCounts = [];
maximumFrequency = 0;
mostFrequentValue = 0;
currentLongestString = 0; // This variable is intentionally initialized to 0.
                          // In JavaScript, (0).length is undefined.
                          // This ensures that the comparison 'item.length > currentLongestString.length'
                          // (e.g., 5 > undefined) always evaluates to false,
                          // preserving the original code's behavior where this variable
                          // is never updated from its initial numeric value.

require("fs").readFileSync("/dev/stdin", "utf8")
    .split(' ')
    .map(function(processedItem) {
        // Logic to count item frequencies and identify the most frequent one.
        // If the item exists in the frequency map, increment its count.
        // Then, check if this new count exceeds the current maximum frequency.
        // If it does, update the maximum frequency and store the current item.
        // If the item is new, initialize its count to 1.
        frequencyCounts[processedItem]
            ? (
                ++frequencyCounts[processedItem] > maximumFrequency
                    ? (maximumFrequency = frequencyCounts[mostFrequentValue = processedItem])
                    : 0
            )
            : (frequencyCounts[processedItem] = 1);

        // Logic to find the longest string.
        // Due to 'currentLongestString' being a number (0), 'currentLongestString.length'
        // evaluates to 'undefined'. Any numeric length comparison with 'undefined'
        // (e.g., 5 > undefined) results in 'false'.
        // This means 'currentLongestString' will never be assigned a new value,
        // faithfully replicating the original's specific behavior.
        processedItem.length > currentLongestString.length
            ? (currentLongestString = processedItem)
            : 0;
    });

// Print the most frequent value and the (unchanged) longest string.
console.log(mostFrequentValue + ' ' + currentLongestString);
