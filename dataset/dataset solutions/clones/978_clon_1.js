/* This file demonstrates a pattern matching algorithm.
 * It reads a grid and a pattern from standard input. */

// config = { input: 'tmp', newline: '\r\n' }; // This configuration is for Windows systems.
// For example, if you were to read from a temporary file named 'tmp'.

config = {
    input   :   '/dev/stdin',    // Specifies the input source as standard input, common on Linux/Unix.
    newline :   '\n'             // Defines the newline character for Linux/Unix systems.
};


// Read the entire input file, convert it to an ASCII string,
// and then split it into an array of lines using the determined newline character.
line  =  require('fs') . readFileSync ( config.input ,   'ascii' )
    .split ( config.newline ) ;


// The first line contains grid dimensions. Parse them into numbers.
line [ 0 ]   =   line [ 0 ] . split ( ' ' ) . map ( Number ) ;

// Extract the height (H) and width (W) of the main field.
H   =   line [ 0 ] [ 0 ] ; // H represents the number of rows in the main field.
W   =   line [ 0 ] [ 1 ] ; // W represents the number of columns in the main field.


// Extract the main field itself. It starts from line 1 and goes for H lines.
field =   line . slice ( 1 ,   1 + H ) ;


// The line immediately following the main field contains pattern dimensions.
line [ 1 + H ] = line [ 1 + H ] . split ( ' ' ) . map ( Number ) ;


// Extract the height (R) and width (C) of the pattern.
R   =   line [ 1 + H ] [ 0 ] ; // R represents the number of rows in the pattern.
C   =   line [ 1 + H ] [ 1 ] ; // C represents the number of columns in the pattern.


// Extract the pattern itself. It starts after the main field and its dimensions.
pat = line . slice ( 1 + H + 1 ,   1 + H + 1 + R ) ;


// If the pattern is larger than the field in either dimension, it cannot exist.
// In such a case, exit the process immediately.
if   ( H   <   R   ||   W   <   C )   process . exit ( ) ;


// Prepare the main field for efficient pattern matching.
// This involves creating a 'matrix' where each element is a possible C-width substring.
matrix = field . map ( function   ( str )   {

    var   res ,   i   ; // Declare local variables for the function scope.

    res   =   [ ]   ; // Initialize an empty array to store substrings for the current row.

    // Iterate through the current row string 'str' to extract all possible substrings of length C.
    for   ( i   =   0   ;   i   <=   W - C   ;   i ++ )
    {
        res . push ( str . slice ( i ,   i + C ) ) ; // Add the substring to the result array.
    }

    return   res   ; // Return the array of substrings for this row.
} ) ;


// Begin the search for the pattern within the main field.
// Iterate through all possible starting row positions for the pattern.
for   ( i   =   0   ;   i   <=   H - R   ;   i ++ )
{
    // Iterate through all possible starting column positions for the pattern.
    for   ( j   =   0   ;   j   <=   W - C   ;   j ++ )
    {
        // Assume the pattern is found until a mismatch is detected.
        flag   =   true   ;

        // Compare each row of the pattern with the corresponding part of the field.
        for   ( k   =   0   ;   k   <   R   ;   k ++ )
        {
            // Check if the current row of the pattern matches the corresponding segment in the matrix.
            if   ( matrix [ i + k ] [ j ]   !==   pat [ k ] )
            {
                flag   =   false   ; // Mismatch found, set flag to false.
                break   ;          // No need to check further rows for this position, break out.
            }
        }

        // If the flag is still true after checking all rows, the pattern is found.
        if   ( flag )
        {
            // Output the coordinates (row, column) where the pattern was found.
            console . log ( i ,   j ) ;
        }
    }
}