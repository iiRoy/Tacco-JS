// Configuration object for input handling. This setup is for Linux environments.
config = {     input : '/dev/stdin'    ,    newline : '\n'     }; /* This comment describes the purpose of the config object. */


// Read the entire file synchronously, decode it as ASCII, and then split it into an array of lines.
line    =    require('fs')   .    readFileSync( config.input ,   'ascii' )
    .split(   config.newline   ) ; // The 'line' variable now holds an array of strings, each representing a line from the input file.


// Assign the first line of input to variable T (Text).
T   =   line[ 0 ] ;

// Assign the second line of input to variable P (Pattern).
P   =   line[ 1 ] ;


// Loop to find all occurrences of pattern P within text T.
// The loop continues as long as indexOf returns a valid index (not -1).
// After each find, the search starts from the next character to avoid finding the same match repeatedly.
for (    i   =   T.indexOf(   P   ,   0   )    ;    i   !==   -1    ;    i   =   T.indexOf(   P   ,   ++i   )    )
{
    // Print the starting index of each found occurrence of the pattern.
    console.log(   i   ) ;
}