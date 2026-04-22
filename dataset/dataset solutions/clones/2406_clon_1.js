/*
 * This JavaScript code snippet is designed to read input from the standard input stream,
 * process it, and then output a calculated result to the standard output stream
 * when the input stream is closed.
 *
 * It leverages Node.js's built-in 'readline' module for handling line-by-line input.
 */


// Resumes the standard input stream. This is crucial for event-driven input.
process
    .
    stdin
    .
    resume
    (
        )
;


// Sets the character encoding for the standard input stream to UTF-8.
// This ensures proper interpretation of various characters.
process
    .
    stdin
    .
    setEncoding
    (
        'utf-8'
    )
;


// Declares an array to hold the parsed input lines.
// It is initialized as an empty array.
let
    input_lines
    =
    [
        ]
;


// Creates an instance of the readline interface.
// This interface allows reading data from a readable stream (like stdin)
// one line at a time.
let
    reader
    =
    require
    (
        'readline'
    )
    .
    createInterface
    (
        {
            // Specifies the input stream to be read from.
            input
                :
                process
                    .
                    stdin,

            // Specifies the output stream to write prompts to (though not used for prompts here).
            output
                :
                process
                    .
                    stdout
        }
    )
;


// Attaches an event listener for the 'line' event.
// This callback function is executed every time a new line of input is received.
reader
    .
    on
    (
        'line',
        (
            line
        )
            =>
        {
            // Splits the received 'line' string by space characters
            // and assigns the resulting array of substrings to 'input_lines'.
            input_lines
                =
                line
                    .
                    split
                    (
                        ' '
                    )
            ;
        }
    )
;


// Extracts the first element from the 'input_lines' array and assigns it to 'x'.
// Note: At this point, 'x' will be a string as read from input.
let
    x
    =
    input_lines
    [
        0
    ]
;


// Extracts the second element from the 'input_lines' array and assigns it to 'y'.
// Similarly, 'y' will also be a string.
let
    y
    =
    input_lines
    [
        1
    ]
;


// Initiates a conditional block based on the values of 'x' and 'y'.
// The strict equality operator (===) is used for comparison.
if
(
    x
    ===
    1
    &&
    y
    ===
    1
)
{
    // If both 'x' and 'y' are strictly equal to the number 1,
    // a 'close' event handler is registered.
    reader
        .
        on
        (
            'close',
            (
                )
                =>
            {
                // When the input stream closes, this calculation is performed and logged.
                console
                    .
                    log
                    (
                        300000
                        *
                        2
                        +
                        400000
                    )
                ;
            }
        )
}
else
{
    // If the condition (x === 1 && y === 1) is false,
    // a different 'close' event handler is registered.
    reader
        .
        on
        (
            'close',
            (
                )
                =>
            {
                // When the input stream closes, this alternative calculation is performed and logged.
                // Note: x and y are implicitly converted to numbers for arithmetic operations.
                console
                    .
                    log
                    (
                        100000
                        *
                        (
                            (
                                4
                                -
                                x
                            )
                            +
                            (
                                4
                                -
                                y
                            )
                        )
                    )
                ;
            }
        )
}
// End of the script. The actual output will occur only when the 'close' event is triggered.