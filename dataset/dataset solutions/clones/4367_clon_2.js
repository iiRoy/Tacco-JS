function ProcessInput(rawData) {
    // Split the entire input string into individual lines.
    let processedLines = rawData.split('\n');

    // Remove the first line, which might be a header or count.
    processedLines.shift();

    // Transform each remaining line.
    // Each line is split by space, and then each part is converted to an integer.
    processedLines = processedLines.map(function(lineStr) {
        return lineStr.split(' ').map(function(numStr) {
            // Parse the string part into a base-10 integer.
            return parseInt(numStr, 10);
        });
    });

    // Initialize a variable to accumulate the final result.
    let totalCount = 0;

    // Iterate over each processed line (which is now an array of numbers).
    processedLines.forEach(function(currentPair) {
        // Add the calculated range (end - start + 1) to the total.
        totalCount += (currentPair[1] - currentPair[0] + 1);
    });

    // Output the final accumulated count to the console.
    console.log('%d', totalCount);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
