/* This code snippet is engineered to translate Roman numeral inputs into their decimal integer counterparts. */
// It processes each distinct line of standard input as a separate numeral conversion task.
(
    // Define the sequence of Roman numeral symbols, including an initial placeholder.
    romanCharacterMap = "?_I_V_X_L_C_D_M",
    // Access the file system module from the Node.js runtime environment.
    fileSystemOperations = require("node:fs"),
    // Read the complete content from the standard input file descriptor.
    // The received data is parsed using UTF-8 character encoding.
    streamedInputBuffer = fileSystemOperations.readFileSync(
        "/proc/self/fd/0", // A common Unix-like path for standard input.
        "utf-8"          // Specify the desired text encoding.
    )
    // Divide the entire input buffer into an array of individual lines.
    .split( "\x0A" ) // Use the hexadecimal representation for the newline character.
    // Process each individual line (entry) within the array.
    .map(
        function ( currentTextualEntry ) {
            // Check if the current line contains any actual characters.
            currentTextualEntry
                ? (
                    // If the line is not empty, initialize variables for the conversion process.
                    // `currentDigitVal`: stores the integer value of the Roman character being examined.
                    // `totalAccumulation`: keeps the running sum for the entire numeral.
                    // `previousElementVal`: holds the value of the Roman character processed immediately before the current one.
                    ( currentDigitVal = 0, totalAccumulation = 0, previousElementVal = 0 ),
                    // Break the current line into individual characters and process each one.
                    currentTextualEntry.split( '' ).map(
                        function ( romanSymbolUnit ) {
                            // Compute the decimal value for the current Roman symbol.
                            // The formula intelligently extracts values (1, 5, 10, 50, 100, 500, 1000)
                            // based on the symbol's index in `romanCharacterMap` and its position parity.
                            currentDigitVal = Math.pow( 10, ( ( currentDigitVal = romanCharacterMap.indexOf( romanSymbolUnit ) ) / 2 ) | 0 ) / ( 2 - ( currentDigitVal % 2 ) );

                            // Apply the subtractive rule for Roman numerals (e.g., 'IV' is 4).
                            // If the value of the current symbol is greater than that of the previous one,
                            // adjust the accumulated total by subtracting twice the previous value.
                            currentDigitVal > previousElementVal ? ( totalAccumulation -= previousElementVal * 2 ) : 0,
                            // Add the current symbol's decimal value to the running total.
                            totalAccumulation += currentDigitVal,
                            // Update the 'previous' value for the next iteration step.
                            ( previousElementVal = currentDigitVal )
                        }
                    ),
                    // Once all symbols in the line are processed, display the final decimal result.
                    console.log( totalAccumulation )
                )
                : 0 // If the line was empty, no operation is performed; the expression evaluates to 0.
        }
    )
);