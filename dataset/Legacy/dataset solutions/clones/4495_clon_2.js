process.stdin.setEncoding('utf8'); // Configure standard input to use UTF-8 encoding

process.stdin.on('readable', function() {
    // Attempt to read a chunk of data from the input stream
    let dataBlock = process.stdin.read();
    let lineSegments; // Declare a variable to store processed lines

    // Proceed only if a data block was successfully read (i.e., not null)
    if (dataBlock !== null) {
        // Split the received data into an array of strings, using newline as a delimiter
        lineSegments = dataBlock.split('\n');

        // If the last element in the array is an empty string (often due to a trailing newline),
        // remove it to avoid processing an empty line
        if (lineSegments[lineSegments.length - 1] === '') {
            lineSegments.pop();
        }

        // Take the very first line, split it by spaces, and then map each resulting part
        // The map function here simply returns the element as is, effectively doing nothing
        const parsedNumbers = lineSegments[0].split(' ').map(function(item) {
            return item; // Return the current item without modification
        });

        // Extract the first element from the 'parsedNumbers' array; this will be our initial string
        let initialString = parsedNumbers[0];

        // Call the primary processing function with a modified version of the initial string
        // The string is truncated by its last character before being passed to the function
        // The result of this function call is then printed to the console
        console.log(processString(initialString.slice(0, initialString.length - 1)));
    }
});

/**
 * Recursively processes a given string based on its length and character symmetry.
 * The function aims to find a specific pattern or reduce the string until a condition is met.
 *
 * @param {string} currentStr The string to be evaluated and processed.
 * @returns {number} The final length of the string after all recursive reductions,
 *                   or the result of a subsequent recursive call.
 */
function processString(currentStr) {
    // Check if the length of the current string is an even number
    if (currentStr.length % 2 === 0) {
        // Calculate the midpoint of the string's length
        const halfLength = currentStr.length / 2;

        // Iterate through the first half of the string
        for (let idx = 0; idx < currentStr.length / 2; idx++) {
            // Compare the character at the current index with the character at the corresponding
            // position in the second half of the string (offset by 'halfLength')
            if (currentStr[idx] !== currentStr[idx + halfLength]) {
                // If a mismatch is found, the string does not meet the symmetry condition.
                // Recursively call the function with the string truncated by its last two characters.
                return processString(currentStr.slice(0, currentStr.length - 2));
            }
        }
        // If the loop completes without finding any mismatches, it means the first half
        // perfectly matches the second half. In this case, return the current string's length.
        return currentStr.length;
    } else {
        // If the current string's length is an odd number, it cannot be symmetrically split.
        // Recursively call the function with the string truncated by its last character.
        return processString(currentStr.slice(0, currentStr.length - 1));
    }
}
