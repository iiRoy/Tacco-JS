// This is the main function that processes the input.
function main ( input )
{
    // Retrieve the first line of input for processing.
    var line = input[ 0 ] ;

    // Define the target string 'keyence'.
    var keyence = 'keyence' ;

    // Initialize an index for the 'keyence' string.
    var keyi = 0 ;

    // Flag 'st' (state) - indicates if a mismatch has occurred after a match.
    var st = false ;

    // Flag 'v' (valid/visited) - indicates if the current character matched or not.
    var v = true ;


    // Iterate through each character of the input line.
    for ( var i = 0 ; i < line.length ; i ++ )
    {
        // Check if the current character matches the expected character in 'keyence'.
        if ( line[ i ] === keyence[ keyi ] )
        {
            // If it matches, advance the keyence index.
            keyi ++ ;

            // Reset 'v' as a match just occurred.
            v = false ;
        }
        else
        {
            // If a mismatch occurs:
            // Check if 'v' was false (meaning the previous char matched) AND 'st' is true (meaning we've already had a mismatch after a match).
            if ( ! v && st )
            {
                // This indicates an invalid sequence, so print 'NO' and exit.
                console.log ( 'NO' ) ;
                return ;
            }

            // Set 'v' to true (current char did not match).
            v = true ;

            // Set 'st' to true (a mismatch has now occurred after a potential match).
            st = true ;
        }
    }


    // After iterating through the entire line, check if the entire 'keyence' string was found.
    if ( keyi === keyence.length )
    {
        // If all characters of 'keyence' were matched in sequence, print 'YES'.
        console.log ( 'YES' ) ;
    }
    else
    {
        // Otherwise, if 'keyence' was not fully matched, print 'NO'.
        console.log ( 'NO' ) ;
    }
}


// Global variable to accumulate input from stdin.
var input = '' ;


// --- Standard boilerplate for reading input from stdin in Node.js ---

// Resume stdin to start receiving data.
process . stdin . resume ( ) ;

// Set the encoding for the input stream.
process . stdin . setEncoding ( 'utf8' ) ;


/*
 * Event listener for 'data' event.
 * Appends received chunks of data to the 'input' variable.
 */
process . stdin . on ( 'data' , function ( chunk )
{
    input += chunk ;
} ) ;


/**
 * Event listener for 'end' event.
 * This is triggered when all input has been received.
 *
 * It splits the accumulated input by newline characters
 * and then calls the main processing function.
 */
process . stdin . on ( 'end' , function ( )
{
    input = input . split ( '\n' ) ;
    main ( input ) ;
} ) ;