'use strict' ; // Enforce strict mode for better error handling and performance.

// Define a simple logging utility function.
const log = txt => { console . log ( txt ) ; } ;

// Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
const inputTxt = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( '\n' ) ;


// Parse dimensions n and m from the first line of input.
// Also, initialize 2D arrays 'a' and 'b' from subsequent input lines.
const n = Number ( inputTxt [ 0 ] . split ( ' ' ) [ 0 ] ) ,
      m = Number ( inputTxt [ 0 ] . split ( ' ' ) [ 1 ] ) ,
      a = inputTxt . slice ( 1 , 1 + n ) . map ( val => val . split ( '' ) ) , // Grid 'a' for the larger pattern.
      b = inputTxt . slice ( 1 + n , 1 + n + m ) . map ( val => val . split ( '' ) ) ; // Grid 'b' for the smaller pattern to find.


// Iterate through all possible top-left starting positions (y1, x1) in grid 'a'.
for ( let y1 = 0 ; y1 < n ; y1 ++ )
{
    for ( let x1 = 0 ; x1 < n ; x1 ++ )
    {
        // Check if the first character of grid 'b' matches the current character in 'a'.
        // This is an optimization to quickly skip mismatches.
        if ( a [ y1 ] [ x1 ] === b [ 0 ] [ 0 ] )
        {
            let ok = true ; // Flag to track if the current match attempt is successful.

            // Nested loops to compare grid 'b' against the current subgrid in 'a'.
            for ( let y2 = 0 ; y2 < m ; y2 ++ )
            {
                for ( let x2 = 0 ; x2 < m ; x2 ++ )
                {
                    // Compare characters at corresponding positions.
                    if ( a [ y1 + y2 ] [ x1 + x2 ] === b [ y2 ] [ x2 ] )
                    {
                        continue ; // Characters match, continue to the next one.
                    }
                    else
                    {
                        // Mismatch found, set 'ok' to false and break from the inner loop.
                        ok = false ;
                        break ;
                    }
                }
            }

            // If 'ok' is still true after comparing all characters of 'b',
            // it means grid 'b' was found within grid 'a'.
            if ( ok )
            {
                console . log ( 'Yes' ) ; // Print "Yes" to indicate a match.
                process . exit ( ) ; // Terminate the program as a match has been found.
            }
        }
    }
}

// If the program reaches this point, no match was found after checking all possibilities.
console . log ( 'No' ) ; // Print "No".