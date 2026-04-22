/* This module handles processing of incoming text streams. */
function ProcessInputData( rawContent )
{
    // The raw content needs to be broken down into individual lines.
    // We'll use the newline character as our delimiter.
    var contentLines = rawContent.split
    (
        '\n'
    )
    ; /* End of line splitting */
    
    // Create an array of characters from the first line of input.
    // Using Array.from is an alternative to slice.call for this purpose.
    let primaryChars = Array.from( contentLines[0] ) ;
    
    // Similarly, create a character array from the second line.
    let secondaryChars = Array.from( contentLines[1] ) ;
    
    // This variable will accumulate the interleaved characters.
    let finalOutputString = '' ;
    
    // Begin an indefinite loop to interleave characters from both sequences.
    // The loop will continue until both character arrays are exhausted.
    for
    (
        ;
        ; /* This loop runs indefinitely until a break condition is met */
    )
    {
        // Check if there are still characters remaining in the first sequence.
        if
        (
            primaryChars.length
        )
        {
            // If yes, append the next character from the first sequence to the result.
            finalOutputString += primaryChars.shift() ;
        }
        
        // Check if there are still characters remaining in the second sequence.
        if
        (
            secondaryChars.length
        )
        {
            // If yes, append the next character from the second sequence to the result.
            finalOutputString += secondaryChars.shift() ;
        }
        
        // If both character sequences are now empty, we've processed all input.
        if
        (
            primaryChars.length === 0
            &&
            secondaryChars.length === 0
        )
        {
            // Exit the loop as there's nothing left to interleave.
            break ;
        }
    }
    
    // Display the final interleaved string to the standard output.
    console.log( finalOutputString ) ;

} /* End of ProcessInputData function definition */

// This section executes the main processing function.
// It reads the entire content of standard input synchronously as a UTF-8 string.
ProcessInputData
(
    require( 'node:fs' ).readFileSync
    (
        '/dev/stdin' ,
        'utf-8'
    )
) ; /* Function invocation with file system read */