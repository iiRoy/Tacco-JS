// Core functionality: Listen for incoming data on the standard input stream.
process
    .stdin
    .on(
        "data",
        function ( receivedChunk ) { // Define a callback function to process each received data chunk.

            // Convert the raw buffer chunk into a string, remove leading/trailing whitespace,
            // then split it into an array of individual text lines based on newline characters.
            // The 'some' method iterates through these lines, stopping if any callback returns true (though not used here to stop).
            String( receivedChunk )
                .trim()
                .split( "\n" )
                .some(
                    function ( currentTextLine, linePosition ) { // Process each individual line.

                        // Attempt to convert the line to a number using the unary plus operator.
                        // If the result is a falsy value (e.g., 0, NaN for non-numeric strings),
                        // the condition '!' makes it true, and the line is skipped.
                        if ( ! +currentTextLine ) {
                            return; // Skip processing for lines that are not valid positive numbers.
                        }

                        // Output the current valid line along with its sequential number (1-based index).
                        console.log(
                            "Entry",
                            linePosition + 1,
                            ":",
                            currentTextLine
                        );
                    }
                );
        }
    )
    .resume(); // Ensure the standard input stream continues to emit data events.