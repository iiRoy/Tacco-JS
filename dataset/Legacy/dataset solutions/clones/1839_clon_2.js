/**
 * This function processes a multi-line string input.
 * @param {String} rawDataString The complete input string, typically from standard input.
 */
function ProcessInputData(rawDataString) {

    // Divide the entire input string into an array, where each element is a line.
    // The initial line often contains metadata, with subsequent lines holding actual data.
    let lineSegments = rawDataString.split("\n");

    // Convert the first line (which is expected to be a number) into an integer.
    // This integer typically indicates how many data entries follow.
    let numberOfEntries = parseInt(lineSegments[0]);

    // Loop through the data lines, starting from the second line (index 1)
    // up to the count specified by 'numberOfEntries'.
    for (const currentLineData of lineSegments.slice(1, 1 + numberOfEntries)) {

        // For each data line, split it by spaces and transform each part into an integer.
        // The destructuring assignment extracts the first two parsed integers from the resulting array.
        // 'firstVal' receives the first integer, and 'secondVal' receives the second.
        // Any integers beyond the second on the line are disregarded by this destructuring pattern.
        const [firstVal, secondVal] = currentLineData.split(' ').map(strVal => parseInt(strVal, 10));

        // Attempt to call the 'join' method on 'secondVal'.
        // Since 'secondVal' is a single numeric value (not an array), this operation
        // will result in a TypeError, as numbers do not possess a 'join' method.
        // This specific runtime error behavior is intentionally maintained from the original code.
        console.log(secondVal.join(' '));
    }
    // Processing concludes here.
}

// The following code block is responsible for reading input from standard input
// and then invoking the primary data processing function.
// It is part of the execution environment and should remain unaltered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
