/*
 * This JavaScript program reads an integer from standard input,
 * then prints "ABC" or "ARC" based on its value.
 * It demonstrates basic I/O operations and conditional logic.
 */

// Activate the standard input stream to ensure it doesn't close immediately.
process.stdin
    .resume()
;

    // Configure the standard input stream to interpret incoming bytes
    // as UTF-8 encoded characters.
    process
        .stdin
        .setEncoding
        (
            'utf8'
        )
    ;

// Attach an event listener to the 'data' event of the standard input stream.
// This function will be called whenever data is available from stdin.
process.stdin.on
    (
        'data',
        function
        (
            a // The 'a' parameter receives the incoming data chunk as a Buffer or string.
        )
        {
            // Convert the incoming data chunk to a string and then parse it into an integer.
            // This assumes the input will be a valid integer string.
            var    n    =    parseInt    (    a.toString()    )    ;

            // Based on the parsed integer 'n', output either "ABC" or "ARC" to the console.
            // This is a ternary operator: if n < 1200 is true, "ABC" is chosen; otherwise, "ARC".
            console.log
                (
                    n
                    <
                    1200
                    ?
                    "ABC"
                    :
                    "ARC"
                )
            ; // End of console.log statement

        }
    )
; // End of event listener registration