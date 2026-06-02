var dataCollection = [1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51]; // This array holds a sequence of numbers.

// Retrieve the second command-line argument, which should be the desired index.
var position = process.argv[2];

// Check if the provided position is within the valid bounds of the data collection.
if (1 <= position && position < 32) {
    // If valid, print the element at the calculated index (0-based).
    console.log(dataCollection[position - 1]);
}
