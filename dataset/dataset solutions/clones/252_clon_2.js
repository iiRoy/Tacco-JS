// This section handles obtaining raw data from the system's standard input.
// It leverages Node.js's built-in file system module to access the input source.
var fileContent = require('fs') // Access the File System module.
                  .readFileSync('/dev/stdin', 'utf8') // Read the file synchronously from the standard input path, specifying UTF-8 encoding.
                  .trim(); // Remove any leading or trailing whitespace characters from the acquired string.

// Next, we process the raw content by breaking it into individual lines.
// Each line is considered a distinct record for subsequent numerical extraction.
var contentRows = fileContent.split('\n'); // Divide the entire content string into an array of strings, using newline characters as delimiters.

// Initialize a variable that will store the cumulative sum of all numerical values encountered.
var grandTotal = 0; // The aggregate sum is set to an initial value of zero.

// Declare a temporary variable that will hold each line (record) as it is processed in the loop.
var currentRecord;

// Begin iterating through each available record (line) in the collection.
// The 'shift()' method extracts the first element from the 'contentRows' array and removes it,
// continuing this process until the array becomes empty.
while (currentRecord = contentRows.shift()) {
    // For each individual record, extract all numerical parts.
    // The regular expression /\D+/ matches one or more non-digit characters,
    // effectively splitting the string by anything that is not a number.
    var numberSequence = currentRecord.split(/\D+/);

    // Accumulate the sum of numbers found within the current record and add it to the grand total.
    // The 'reduce' method iterates over the 'numberSequence' array to perform this aggregation.
    // The anonymous function converts each array element to a number using the unary plus operator (+).
    grandTotal += numberSequence.reduce(function(previousAccumulation, currentElement) {
        // The accumulator (previousAccumulation) is updated by adding the numeric value of the current element.
        return previousAccumulation + (+currentElement);
    }, 0); // The initial value for the accumulation process is explicitly set to zero.
}

// Finally, display the calculated grand total to the standard output.
console.log(grandTotal); // Output the final aggregated sum.