/*
 * This program is designed to interact with standard input.
 * It accumulates all lines provided and then processes the initial line
 * to perform a specific arithmetic computation.
 */

// Activate the standard input stream to begin receiving data.
process.stdin.resume();

// Configure the character encoding for the incoming data stream to UTF-8.
process.stdin.setEncoding('utf8');

// Declare a mutable array to store every line of text received from the input.
let receivedStrings = [];

// Instantiate an interface to facilitate reading input on a line-by-line basis.
const inputHandler = require('readline').createInterface({
    // Designate the standard input stream as the source for reading.
    inputStream:  process.stdin,
    // Designate the standard output stream for any interactive output (though none explicitly used here).
    outputStream: process.stdout
});

// Register an event callback: whenever a full line is entered and detected,
// append that line to our collection of received text.
inputHandler.on('line', (incomingText) => {
    receivedStrings.push(incomingText); // Add the current line to the buffer.
});

// Register another event callback: once the input stream signals its closure (e.g., EOF),
// proceed with the core logic of the application.
inputHandler.on('close', () => {

    // Retrieve the very first line from the buffered input and
    // dissect it into an array of substrings using space as the delimiter.
    const firstLineComponents = receivedStrings[0].split(' ');

    // Execute the primary calculation:
    // Multiply the first component (converted to a number) by one,
    // then add it to half of the third component (also converted to a number).
    // The `* 1` explicitly forces numeric conversion for the first element.
    // The `/ 2` implicitly forces numeric conversion for the third element before division.
    console.log(firstLineComponents[0] * 1 + firstLineComponents[2] / 2);

});