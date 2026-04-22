let dataStreamHandler=require('readline').createInterface
    (
        {
            input : process.stdin, /* utilize standard input for data acquisition */
            output: process.stdout // direct output to standard console stream
        }
    );

let receivedInputLines = []; // collection to store all incoming lines

dataStreamHandler.on
    (
        'line', // event triggered upon receiving a new line
        (currentInputLine) =>
            {
                receivedInputLines.push(currentInputLine); // add the line to our buffer
            }
    )
; /* end of line event listener */

dataStreamHandler.on
    (
        'close', // event fired when input stream is terminated
        () =>
            {
                // Process the collected data once input is complete
                let firstProcessedLine = receivedInputLines[0];

                // Divide the initial line into distinct components based on space delimiter
                let valueTokens = firstProcessedLine.split(' ');

                // Extract numerical operands from the tokenized array
                let firstNum = valueTokens[1]; // represents the second element
                let secondNum = valueTokens[2]; // represents the third element

                // Perform core arithmetic operation; implicit type conversion occurs here
                let finalComputation = secondNum - firstNum - 1;

                // Evaluate the parity of the computed value to determine the outcome
                if
                    (
                        finalComputation % 2 === 1 // check if the remainder is one (odd)
                    )
                {
                    console.log('PlayerOne'); // Output for an odd result
                }
                else if
                    (
                        finalComputation % 2 === 0 // check if the remainder is zero (even)
                    )
                {
                    console.log('PlayerTwo'); // Output for an even result
                }
            }
    )
; // end of close event listener definition