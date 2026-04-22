// This initial command ensures that the Node.js process does not exit immediately.
process.stdin.resume();

// Configure the standard input stream to interpret incoming data as UTF-8 encoded text.
process.stdin.setEncoding('utf8');

// Attach an event handler to the 'data' event of the standard input stream.
// This function will be executed whenever new data is available from the input.
process.stdin.on('data', function(dataSegment) {
    // Convert the received data buffer to a string and split it into an array of lines.
    // Each line is separated by a newline character.
    var receivedLines = dataSegment.toString().split('\n');

    // Define an Immediately Invoked Function Expression (IIFE) to process the primary input.
    // The result of this processing is stored in the 'processedOutput' variable.
    var processedOutput = (function(targetNumber) {
        // Create a numeric sequence from 1 up to the specified target number.
        return new NumericSequence(1, targetNumber)
            // Filter the generated sequence based on a set of specific conditions.
            // A number is included if it satisfies any of these criteria:
            .filter(function(currentValue) {
                return (
                    (currentValue % 3 === 0) ||           // Is the number perfectly divisible by three?
                    (currentValue % 10 === 3) ||          // Does the number end with the digit three?
                    (currentValue === 30) ||              // Is the number exactly thirty?
                    (Math.floor(currentValue / 10) % 10 === 3) // Is the tens digit of the number three (e.g., 30, 130)?
                );
            })
            // Join all the filtered numbers into a single string,
            // using a space character as the separator between them.
            .join(' ');

    // Parse the very first line of input as a base-10 integer and pass it to the IIFE.
    }(parseInt(receivedLines[0], 10)));

    // Check if the processed output contains any filtered numbers.
    if (processedOutput) {
        // If there's content, print it to the console, prefixed with a single space.
        console.log(' ', processedOutput);
    }
    else {
        // If the output is empty (no numbers met the criteria), print an empty line.
        console.log();
    }


    /**
     * @description Generates an array of sequential integers within a specified range.
     * @param {number} startPoint - The inclusive starting number of the sequence.
     * @param {number} endPoint - The inclusive ending number of the sequence.
     * @returns {Array<number>} An array containing all integers from startPoint to endPoint.
     */
    function NumericSequence(startPoint, endPoint) {
        var generatedSequence = []; // Initialize an empty array to hold the sequence.
        // Iterate from the starting point up to and including the ending point.
        for (var iteratorVar = startPoint; iteratorVar <= endPoint; ++iteratorVar) {
            generatedSequence.push(iteratorVar); // Add each number to the sequence array.
        }
        return generatedSequence; // Return the fully populated sequence array.
    }
});