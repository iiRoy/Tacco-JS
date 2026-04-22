/*
 * This module defines a primary routine for processing textual input.
 * It demonstrates basic I/O operations and string manipulation.
 */

function   processIncomingContent (    currentPayload
)
{
    // A brief pause for dramatic effect (not really, just a comment).

    // The core logic: combine a predefined prefix with the provided data
    // and then output the resulting string to the standard console.
    console.log ( "ABC" + currentPayload ) ;
}


// This is the initial execution block of the script.
// It retrieves data from the standard input stream,
// ensuring it's interpreted as UTF-8 encoded text,
// and subsequently passes this obtained data to our processing function.
processIncomingContent(
    require("fs")
        .readFileSync(
            "/dev/stdin",
            "utf8"
        )
);