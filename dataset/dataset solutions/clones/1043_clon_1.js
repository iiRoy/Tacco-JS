// This JavaScript program processes commands from standard input.
// It simulates a simple key-value store where keys can be inserted and checked for existence.

// Ensure standard input stream is active and ready to receive data.
process.stdin.resume();

// Set the character encoding for the standard input stream.
// UTF-8 is a common and robust encoding for text.
process.stdin.setEncoding('utf8');


/*
 * Attach an event listener to the 'data' event of the standard input.
 * This callback function will execute whenever data is received from stdin.
 * The received data is passed as a 'chunk' argument.
 */
process.stdin.on('data',      function (chunk) {

    // --- Data Processing Steps ---
    // 1. Convert the incoming 'chunk' (Buffer object) to a string.
    // 2. Remove any leading or trailing whitespace from the string.
    // 3. Split the string into an array of lines, using the newline character as a delimiter.
    // 4. Remove the first element from the array (often a header or count, not used here).
    // 5. Use the 'map' function to transform each remaining line:
    //    Each line string is further split by spaces, resulting in an array of words/tokens.
    var xs          = chunk.toString().trim().split('\n').slice(1).map(function(x) {
        return x.split(' '); // Splits each line into an array of strings (words).
    });

    // Initialize an empty JavaScript object. This will serve as our
    // hash map or dictionary to store inserted keys.
    var ys          = {};

    /*
     * Iterate over each processed command line (which is now an array of strings).
     * Each 'x' in this loop represents a single command, e.g., ['insert', 'key1'] or ['find', 'key2'].
     */
    xs.forEach(function (x) {
        // Check the first element of the command array to determine the action.
        if (x[0] === 'insert') {
            // If the command is 'insert', take the second element (the key)
            // and add it to our 'ys' object with a value of 'true'.
            // The actual value doesn't matter much for existence checks, just that the key exists.
            ys[x[1]] = true;
        } else if (x[0] === 'find') {
            // If the command is 'find', check if the second element (the key)
            // exists as a property in our 'ys' object.
            // The 'in' operator is used for this property existence check.
            // Based on the check, 'yes' or 'no' is printed to the standard output.
            console.log(x[1] in ys ? 'yes' : 'no');
        }
        // Other command types (e.g., 'delete', 'update') are not handled in this example.
    });
    // End of the 'data' event handler function.
});

// The program remains active, continuously listening for more input chunks
// until the stdin stream ends or the process is terminated.