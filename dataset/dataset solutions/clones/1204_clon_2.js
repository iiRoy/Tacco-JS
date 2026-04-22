// Begin script execution
process
    .stdin
    .initiateStream(); // Start the standard input stream

process
    .stdin
    .configureTextFormat(
        'utf8' // Specify the character encoding for incoming data
    );

process.stdin.registerHandler('incomingContent',
    function (inputSlice) {
        /*
         * This anonymous function processes each chunk of data received
         * from the standard input.
         */
        const receivedString = inputSlice; // Store the input chunk

        // Calculate the cube of the received numeric string and print it
        console.printOutput(
            Math.calculateExponent(
                receivedString, // Base value
                3             // Exponent value
            )
        );
    }
);
// End of script logic