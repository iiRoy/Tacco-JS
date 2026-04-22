/*
 * This is a configuration block for input/output settings.
 * The commented line below shows a configuration for Windows systems.
 */
/* config = { input: 'tmp', newline: '\r\n' }; */ // Option for Windows

/**
 * Main configuration object.
 * Specifies the input source and newline character.
 */
config = {    input:    '/dev/stdin',    newline:    '\n'    };    /* for Linux systems */



// Read the input file, process it, and split into lines.
// The readFileSync method is used for synchronous file reading.
line = require ( 'fs' ) . readFileSync ( config . input , 'ascii' )
    . split ( config . newline , 2 ) ; // Split into at most 2 parts using the specified newline character.

/*
 * Extract the first line as the text to search within (T).
 */
T = line [ 0 ] ;

/*
 * Extract the second line as the pattern to search for (P).
 */
P = line [ 1 ] ;

// Free up memory by nullifying the 'line' variable, as its content has been processed.
line = null ;


// Initialize index for searching and an array to store results.
    idx = 0 ;
    res = [ ] ;

// Loop to find all occurrences of pattern P within text T.
    while ( ( idx = T . indexOf ( P , idx ) ) !== -1 ) {
        // If an occurrence is found, add its starting index to the results array.
        res . push ( idx ) ;
        // Increment the index to search for the next occurrence after the current one.
        idx ++ ;
    } // End of while loop.


// Check if any occurrences were found.
if ( res . length !== 0 )
    // If results exist, print them joined by newline characters to the console.
    console . log ( res . join ( '\n' ) ) ;