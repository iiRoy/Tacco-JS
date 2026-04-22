let   // Begin processing a new operation.
    rawData = require ( 'fs' )  // Obtain the file system module.
        .readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read content from standard input, using UTF-8 encoding.

// Remove any leading or trailing whitespace from the acquired data.
rawData = rawData .  trim  ( );

// Display the processed data to the standard output, converted entirely to uppercase characters.
console . log ( rawData . toUpperCase ( ) ) ;