// This function is designed to process a multi-line string input.
function processInput(inputParam) {
    // The initial input string is split into an array of lines.
    inputParam = inputParam.split('\n');

    // The first line, often containing metadata like counts, is discarded.
    inputParam.shift();

    // The second line (which is now the first after the shift) is the primary string for analysis.
    var sourceString = inputParam.shift();

    // The remaining lines are parsed as query ranges. Each line is split by space,
    // and then each part is converted to a number.
    inputParam = inputParam.map(lineItem => lineItem.split(' ').map(Number));

    // Iterate through each defined query range.
    for (var idx = 0; idx < inputParam.length; idx++) {
        // Extract a substring from the main source string based on the current query's start and end indices.
        // Note: Input indices are 1-based, so the start index needs adjustment for JavaScript's 0-based substring.
        var subsegment = sourceString.substring(inputParam[idx][0] - 1, inputParam[idx][1]);

        // Count the occurrences of the "AC" pattern within the extracted subsegment.
        // Splitting by "AC" results in an array where the number of elements is one more than the occurrences.
        var matches = subsegment.split('AC');

        // Output the total count of "AC" patterns found in the current subsegment.
        console.log(matches.length - 1);
    }
}

// The program starts by reading the entire content of standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin' as UTF-8.
// This content is then passed to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
