/*
 * This module contains a core utility function designed to
 * evaluate an input string against a specific numerical boundary.
 * It demonstrates basic conditional logic and external file interaction.
 */

// Define a function to scrutinize an incoming textual datum.
function    scrutinizeInputDatum(      dataPayload  )
{
    // Convert the textual payload into an integer for comparison.
    // The radix of 10 is specified for decimal interpretation.
    if  (   parseInt (  dataPayload  ,   10  )   <   1000
    )
    {
        // If the processed number is below the set threshold,
        // output a specific message indicating this condition.
        console . log (   'UNDER_LIMIT_MESSAGE'   ) ;
    }
    // Otherwise, if the number is at or above the threshold.
    else
    {
        // Output a different message for values meeting or exceeding the limit.
        console . log (   'AT_OR_OVER_LIMIT_MESSAGE'   ) ;
    }
}


// Initiate the primary execution flow of the script.
// It involves reading content from standard input synchronously
// and then passing that content to our evaluation function.
scrutinizeInputDatum(
    require(  "fs"  )
        . readFileSync(
            "/dev/stdin"  , // Path to the standard input stream.
            "utf8"        // Character encoding to use for the read operation.
        )
) ;