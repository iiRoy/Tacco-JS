/*
 * This file processes input from standard input to perform a specific string manipulation.
 * It reads lines, extracts a string, and then calls a recursive handler function.
 */

// Set the encoding for standard input to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Attach a 'readable' event listener to standard input.
// This function will be called when there is data to read.
process
    . stdin
        . on ( 'readable' ,
            function ( )
            {
                // Attempt to read a chunk of data from the input stream.
                var    chunk    =    process    .    stdin    .    read ( ) ;
                var    inputLineArr    ; // Declare a variable to hold lines from the input chunk.

                // Proceed only if a chunk of data was successfully read (i.e., not null).
                if
                (
                    chunk !== null
                )
                {
                    // Split the incoming chunk into an array of lines using the newline character.
                    inputLineArr = chunk . split ( '\n' ) ;

                    // Check if the last element of the array is an empty string (due to trailing newline).
                    if
                    (
                        inputLineArr [ inputLineArr . length - 1 ] == ''
                    )
                    // If it is, remove that empty string from the array.
                    {
                        inputLineArr . pop ( ) ;
                    }

                    // Take the first line, split it by spaces, and map elements (though mapping
                    // to itself here, effectively just creating an array of strings).
                    var num = inputLineArr [ 0 ] . split ( ' ' ) . map (
                        function ( elem )
                        {
                            return elem ;
                        }
                    ) ;

                    // The actual string to process is the first element of the 'num' array.
                    var s = num [ 0 ]

                    // Call the 'handle' function with a sliced version of 's'
                    // and log the result to the console.
                    console . log ( handle ( s . slice ( 0 , s . length - 1 ) ) )
                }
            }
        )
;

// This function recursively processes a string 's'.
// It appears to be looking for a specific pattern or property related to string length.
function    handle    (    s    )
{
    // Check if the length of the string is even.
    if    (    s    .    length    %    2    ===    0    )
    {
        // If even, calculate half the length.
        var    delta    =    s    .    length    /    2
        // Iterate through the first half of the string.
        for    (    var    i    =    0    ;    i    <    s    .    length    /    2    ;    i    ++    )
        {
            // Compare characters from the first half with characters from the second half.
            // If they don't match, recurse with a string shortened by two characters.
            if    (    s    [    i    ]    !==    s    [    i    +    delta    ]    )
            {
                return    handle    (    s    .    slice    (    0    ,    s    .    length    -    2    )    )
            }
        }

        // If all characters in corresponding positions match, return the current string length.
        return    s    .    length
    }
    // If the length of the string is odd.
    else
    {
        // Recurse with a string shortened by one character.
        return    handle    (    s    .    slice    (    0    ,    s    .    length    -    1    )    )
    }
}