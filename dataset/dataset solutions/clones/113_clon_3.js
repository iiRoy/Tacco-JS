const fileSystemUtility = require('fs'); // Alias the 'fs' module for clarity

// Initialize variables to track frequency information.
// These variables correspond to the original 'b', 'm', 'n', and 'p'.
// 'collectionOfMostFrequentItems' will store the lines found to have the highest frequency.
// 'currentCountOfSequence' tracks the count (minus one) of the current consecutive sequence of identical lines.
// 'overallMaximumCountFound' stores the highest count (minus one) observed so far.
// 'previouslyEncounteredItem' holds the last processed line, initialized to 0, mimicking the original sentinel.
let collectionOfMostFrequentItems = [];
let currentCountOfSequence = 0;
let overallMaximumCountFound = 0;
let previouslyEncounteredItem = 0;

// Step 1: Read input from standard input.
// The file system module is used to synchronously read all data from /dev/stdin.
// The data is decoded as UTF-8.
const rawInputBuffer = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Step 2: Prepare the input data.
// Trim any leading or trailing whitespace from the raw input string.
const cleanedInputString = rawInputBuffer.trim();

// Split the cleaned string into an array of individual lines based on newline characters.
// Then, sort these lines lexicographically (alphabetically) in place.
const sortedInputLines = cleanedInputString.split('\n');
sortedInputLines.sort();

// Step 3: Iterate through each sorted line to calculate frequencies.
// The forEach method is used to process each line, similar to the original 'map' for side effects.
sortedInputLines.forEach(function(currentProcessedLine) {
    // Check if the current line is identical to the one processed immediately before it.
    const isCurrentLineSameAsPrevious = (currentProcessedLine === previouslyEncounteredItem);

    if (isCurrentLineSameAsPrevious) {
        // If the line is the same, increment the counter for the current sequence.
        // Note: 'currentCountOfSequence' effectively tracks (actual_frequency - 1) due to initialization logic.
        currentCountOfSequence++;
    } else {
        // If the line has changed, it signifies the end of a sequence of 'previouslyEncounteredItem's.
        // We now evaluate the frequency of this completed sequence.

        // Compare the 'currentCountOfSequence' of the just-finished sequence
        // with the 'overallMaximumCountFound' so far.
        if (currentCountOfSequence > overallMaximumCountFound) {
            // A new highest frequency has been discovered.
            // Reset the collection to contain only the item from this new maximum sequence.
            collectionOfMostFrequentItems = [previouslyEncounteredItem];
            overallMaximumCountFound = currentCountOfSequence; // Update the maximum frequency value.
        } else if (currentCountOfSequence === overallMaximumCountFound) {
            // This sequence has a frequency equal to the current maximum.
            // Add its item to the collection of most frequent items.
            collectionOfMostFrequentItems.push(previouslyEncounteredItem);
        }
        // If currentCountOfSequence is less than overallMaximumCountFound, no action is needed.

        // After processing the previous sequence, reset the state for the new sequence.
        // 'previouslyEncounteredItem' is updated to the 'currentProcessedLine'.
        // 'currentCountOfSequence' is reset to 0. This means the first occurrence of
        // a new line does not contribute to 'currentCountOfSequence' until a subsequent identical line appears,
        // mirroring the original code's counting behavior.
        previouslyEncounteredItem = currentProcessedLine;
        currentCountOfSequence = 0;
    }
});

// Important Note: The original code does not include any explicit post-loop logic
// to process the count of the very last sequence of items in the input.
// Therefore, this clone also intentionally omits such a processing step to
// maintain identical functional behavior, including this specific characteristic.

// Step 4: Output the results.
// Join all items in the 'collectionOfMostFrequentItems' array with newline characters
// and print the resulting string to the console (standard output).
// If the input was empty or processed in a way that '0' was added, '0' might appear in the output.
console.log(collectionOfMostFrequentItems.join('\n'));