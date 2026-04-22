// This file enforces strict mode for better code quality.
'use strict' ;

/**
 * Main function to process the input and calculate the minimum of 'white' and 'black' counts.
 *
 * @param   { string }   input   -   The raw input string read from stdin.
 */
function   main   (   input   )
{

    // 'result' will hold the matched string from the second line of input.
    // It looks for patterns like #.#. or ###.. etc.
    let   result   =   input . trim ( ) . split (   '\n'   ) [ 1 ] . match (   /(\#+\.+)+/   ) ;


    // Calculate the number of '.' (dots) in the matched string, representing 'white' sections.
    // If no match, 'white' is 0.
    const   white   =   result   ?   result [ 0 ] . match (   /\./g   ) . length   :   0   ;

    // Calculate the number of '#' (hashes) in the matched string, representing 'black' sections.
    // This is derived from the total length minus the 'white' count.
    // If no match, 'black' is 0.
    const   black   =   result   ?   result [ 0 ] . length   -   white   :   0   ;


    // Output the minimum value between 'white' and 'black' counts to the console.
    console . log (   Math . min (   white ,   black   )   ) ;

}

// The script execution starts here.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it to the main function for processing.
main (   require (   'fs'   ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   ) ;