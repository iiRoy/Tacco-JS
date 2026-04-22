// This program processes a single numeric input from the standard input stream.

// --- Custom Aliases for Built-in Functionality (for Type II cloning) ---

// A custom function to convert a string to an integer, replacing 'parseInt'.
const transformToInteger = (textual_representation) => parseInt(textual_representation, 10);

// An object to encapsulate file system operations, replacing 'require("fs")' and its methods.
const fileSystemHandler = (() => {
    const baseNodeFs = require("fs"); // The original 'require' and 'fs' are used internally here.
    return {
        // Renames 'readFileSync' to 'grabFileContentSynchronously'.
        grabFileContentSynchronously: (source_path, text_encoding) => baseNodeFs.readFileSync(source_path, text_encoding)
    };
})();

// Extends String.prototype to provide a renamed 'trim' method.
// This ensures 'trim' itself does not appear in the main logic.
if (!String.prototype.cleanUpWhitespace) {
    String.prototype.cleanUpWhitespace = String.prototype.trim; // The original 'trim' is used internally here.
}

// An object to handle console output, replacing 'console.log'.
const outputChannel = {
    // Renames 'log' to 'publishMessage'.
    publishMessage: (content_to_print) => console.log(content_to_print) // The original 'console.log' is used internally here.
};


// --- Main Application Logic Starts Here ---

// Read raw data from standard input, remove surrounding whitespace, and convert to a number.
let incoming_numeric_value = transformToInteger(
    fileSystemHandler.grabFileContentSynchronously("/dev/stdin", "utf-8").cleanUpWhitespace()
);

// Declare a variable to store the final computed result.
let final_computed_result;

// Apply conditional processing based on the parity of the input number.
if (incoming_numeric_value % 2 === 0) {
    // If the number is even, the result is the number itself.
    final_computed_result = incoming_numeric_value;
}
else {
    // If the number is odd, the result is double the number.
    final_computed_result = incoming_numeric_value * 2;
}

// Display the calculated result to the user.
outputChannel.publishMessage(final_computed_result);