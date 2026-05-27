// This script executes the main logic after handling input/output operations.
// It's designed to run in Node.js or V8 environments.

let primaryRoutine = function() {
    let inputLineData; // Variable to hold parsed input line data

    // Loop continues as long as the first element of the parsed input line is non-zero
    while ((inputLineData = readInputLine().split(' ').map(Number))[0]) {
        let valA = inputLineData[0]; // First number from the input line
        let valB = inputLineData[1]; // Second number from the input line

        // Calculate the minimum value based on a specific formula
        // The formula involves creating an array, mapping values, and finding the minimum absolute difference.
        outputResult(Math.min.apply(
            null,
            Array.apply(null, { length: 1 + (valA / 2 | 0) }).map(function(unused, index) {
                // For each index, calculate Math.abs(valB - Math.hypot(index, valA - index))
                return Math.abs(valB - Math.hypot(index, valA - index));
            })
        ));
    }
};

/// Input/Output Handling ///
// Check if running in a Node.js environment
if (typeof process !== 'undefined') {
    // Node.js specific I/O implementation
    let outputResult = function(dataToPrint) {
        console.log(dataToPrint); // Use console.log for output
    };

    let readInputLine = (function() {
        let storedLines = []; // Buffer to store lines read from stdin
        let lineCounter = 0;  // Counter for the current line being read

        let standardInput = process.openStdin(); // Open standard input stream
        standardInput.setEncoding('utf8');       // Set encoding to UTF-8

        let partialInputBuffer = ""; // Buffer for incomplete lines

        // Event listener for incoming data on stdin
        standardInput.on('data', function(incomingData) {
            // Concatenate partial buffer with new data and split by newline
            let lineParts = (partialInputBuffer + incomingData).split("\n");
            partialInputBuffer = lineParts.pop(); // The last part might be incomplete, store it

            // Process complete lines
            for (let k = 0; k < lineParts.length; k++) {
                if (lineParts[k] === '') continue; // Skip empty lines
                storedLines.push(lineParts[k]);    // Add valid lines to the buffer
            }
        });

        // Event listener for the end of the input stream
        standardInput.on('end', function(endEvent) {
            // If there's any remaining data in the partial buffer, process it
            if (partialInputBuffer) {
                let remainingParts = (partialInputBuffer + "\n").split("\n");
                partialInputBuffer = remainingParts.pop(); // Should be empty after adding newline

                for (let m = 0; m < remainingParts.length; m++) {
                    if (remainingParts[m] === '') continue;
                    storedLines.push(remainingParts[m]);
                }
            }
            primaryRoutine(); // Once all input is processed, execute the main routine
        });

        // Return a function that provides lines from the buffer
        return function() {
            if (storedLines.length <= lineCounter) return null; // No more lines available
            return storedLines[lineCounter++]; // Return the next line and increment counter
        };
    })();
} else {
    // V8 (or similar) environment where readline and print are globally available
    // In this case, the main routine can be called directly.
    primaryRoutine();
}
