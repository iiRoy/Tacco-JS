var systemIO_Manager = require("fs") ;


// Begin the main execution path: read data from standard input and process it.
ProcessInputSequence( systemIO_Manager.readFileSync( "/dev/stdin" , "utf-8" ) ) ;


/*
 * Core function to process a given textual input stream.
 * It filters characters based on their position.
 * @param {string} incomingDataStream - The complete string data received for processing.
 */
function ProcessInputSequence ( incomingDataStream )
{
    // Step 1: Normalize the input.
    // Split the entire stream by newline characters,
    // take only the very first line (index 0),
    // and then break that line down into an array of individual characters.
    let char_Elements = incomingDataStream
                                  .split( "\n" )
                                  [0]
                                  .split( "" ) ;

    // Step 2: Initialize a container for the filtered output.
    let finalResult_String = "" ;

    // Step 3: Iterate through the character elements, appending specific ones to the result.
    // The loop increments by two, effectively selecting characters at even indices (0, 2, 4, ...).
    for ( let position_Index = 0 ;
          position_Index < char_Elements.length ;
          position_Index += 2 )
    {
        // Concatenate the character at the current even index to our accumulating result string.
        finalResult_String += char_Elements[ position_Index ] ;
    }

    // Step 4: Output the accumulated string to the standard console.
    console.log( finalResult_String ) ;
}