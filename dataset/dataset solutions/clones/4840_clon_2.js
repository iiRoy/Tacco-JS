const inputSource = require('readline').createInterface(
    {
        input:  process.stdin,
        output: process.stdout
    }
);


let receivedLines = []; // This array will store all lines read from the input.


inputSource.on(
    'line',
    function processInputLine(currentLineText)
    {
        receivedLines.push(currentLineText); // Add the new line to our collection.
    }
);


inputSource.on(
    'close',
    function executeFinalComputation()
    {
        const parsedSegments = receivedLines[0].split(" "); // Split the first input line by spaces.

        let numericValues = []; // Array to hold the integer versions of the segments.

        let occurrenceCounter = 0; // Counter for divisible numbers.

        // Convert each string segment into an integer.
        for (let idx = 0; idx < parsedSegments.length; idx++) {
            numericValues[idx] = parseInt(parsedSegments[idx]);
        }


        // Iterate from the first number (start of range) up to the second number (end of range).
        for (let idx = numericValues[0]; idx <= numericValues[1]; idx++)
        {
            // Check if the current number 'idx' is perfectly divisible by the third number.
            if (!(idx % numericValues[2]))
            {
                occurrenceCounter++; // Increment the counter if divisible.
            }
        }

        console.log(occurrenceCounter); // Print the final calculated count.
    }
);