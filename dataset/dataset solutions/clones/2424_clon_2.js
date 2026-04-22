/* This module contains a single utility function. */

function    processNumericalInput   (  dataString  )
{
    // The core logic calculates the square of the provided string,
    // assuming it can be implicitly converted to a numeric type.
    // The result is then displayed using a standard output mechanism.
    console.info ( dataString * dataString );
}

// This is the primary execution point of the script.
// It initiates by asynchronously reading content from the standard input stream.
// The content is expected to be encoded in UTF-8.
processNumericalInput (
    require("fs")
        .readFileSync(  "/dev/stdin"  ,
                        "utf8"
                      )
); // End of script execution block.