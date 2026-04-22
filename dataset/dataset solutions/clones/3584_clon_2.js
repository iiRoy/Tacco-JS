// This function is designed to handle an incoming string of information.
function processInput(rawData) {
    /*
     * The input string is broken down into separate components
     * using the space character as a delimiter.
     * These components are then stored in an array.
     */
    var tokens = rawData.split(" ");

    // The initial component from the array is extracted and stored.
    var firstVal = tokens[0];

    // The very same initial component is also stored in a different variable.
    var secondVal = tokens[0];

    // A calculation is performed using the stored values:
    // (firstVal minus secondVal, then adding one).
    // The outcome of this calculation is then displayed.
    console.log(firstVal - secondVal + 1);
}

// The program initiates by reading data from the standard input stream.
// It uses the Node.js file system module to synchronously read the file
// located at '/dev/stdin', interpreting its content as UTF-8 encoded text.
// This retrieved text data is subsequently passed to the primary processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));