for (
    tallySheet = [], // Initialize an array to store frequency counts of items.
    reverseIterator = 100; // Set the upper bound for item indices (exclusive).
    reverseIterator--;     // Decrement the iterator from the upper bound down to zero.
) {
    // In each iteration, set the current array element to zero.
    // Also, update the 'highestFrequency' tracker to zero, ensuring it's initialized.
    highestFrequency = tallySheet[reverseIterator] = 0;
}

// Read input data from standard input, process it line by line.
// Each valid numerical line represents an item whose frequency should be incremented.
// Simultaneously, track the highest frequency encountered across all items.
require("fs").readFileSync(
    "/dev/stdin", // Specify the standard input device path.
    "utf8"        // Define the character encoding for reading the file.
)
.split('\n') // Divide the entire input content into an array of individual lines.
.some(function(dataPoint) { // Iterate through each line of the input.
    // Check if the current line can be successfully converted to a valid, non-zero number.
    if ( Number(dataPoint) ) {
        // If it's a valid number, increment the frequency count for that item in our tally sheet.
        tallySheet[Number(dataPoint)]++;

        // Compare the updated frequency of the current item with the previously recorded highest frequency.
        // If the current item's frequency is greater, update 'highestFrequency'.
        highestFrequency = (
            tallySheet[Number(dataPoint)] > highestFrequency
        ) ?
            tallySheet[Number(dataPoint)] : // Assign the new higher frequency.
            highestFrequency;              // Retain the existing highest frequency.
    }
    // The 'some' method continues iterating as long as the callback returns a falsy value.
    return false; // Ensure iteration continues through all input lines.
});

// After all input has been processed, iterate through the frequency array
// to identify and print the indices of all items that share the maximum recorded frequency.
tallySheet.some(
    function(occurrenceNum, targetIndex) { // Iterate through the frequency array elements and their indices.
        // Check if the frequency count of the current item matches the overall highest frequency.
        if (occurrenceNum === highestFrequency) {
            // If the frequencies match, print the index of this item.
            console.log(targetIndex);
        }
        // The 'some' method continues iterating as long as the callback returns a falsy value.
        return false; // Ensure iteration continues through all elements in the frequency array.
    }
);