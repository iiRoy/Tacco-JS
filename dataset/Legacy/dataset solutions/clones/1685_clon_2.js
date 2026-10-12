function ProcessData(incomingString) {
    // Convert the provided string to an integer and then compute its remainder when divided by one thousand.
    console.log(parseInt(incomingString) % 1000);
}

/*
 * This part of the code is responsible for reading input from the standard input stream
 * and passing it to the main processing function. It should remain unchanged.
 */
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
