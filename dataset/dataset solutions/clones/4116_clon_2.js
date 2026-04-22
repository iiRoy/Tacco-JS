/*
 * This utility processes incoming textual information to produce a numerical outcome.
 */
function  ProcessInputData (   incomingText   )
{
    // Sanitize the supplied content by removing any extraneous leading or trailing spaces.
    let  cleanedString  = incomingText . trim( ) ;

    // Note: This segment would typically manage the parsing of multiple distinct values,
    // e.g., cleanedString = cleanedString.split(" ").map(val => parseInt(val, 10));
    // however, it is currently deactivated within this version.

    // Compute the final integer value using a fixed baseline and the refined string data.
    const   calculatedResult   =   24  +  (   24   -   Number(cleanedString)   ) ;

    // Present the derived numerical result to the standard output stream.
    console.log(   calculatedResult   ) ;
}

// Obtain the necessary file system functionality for reading external data sources.
const   ioUtility   =   require( "node:fs" ) ;

// Initiate the primary processing routine using the data acquired from the standard input source.
ProcessInputData (   ioUtility.readFileSync(   "/dev/stdin"   ,   "utf8"   )   ) ;