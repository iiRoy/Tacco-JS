/*
 * This is the main function that processes the input for a grid-related problem.
 * It takes a single string 'input' which typically comes from standard input.
 * The goal is to print a pattern of '0's and '1's based on given dimensions and parameters.
 */
function     Main(  input  )
{
    // Enforce strict parsing and execution rules for the current script.
    "use strict";

    /*
     * Split the entire input string by newline characters.
     * This separates the lines of input into an array.
     */
    const temp = input . split ( "\n" );



    // The first line of input contains four space-separated integers: h, w, a, b.
    // We parse them here.
    const hwab = temp . shift ( ) . split ( " " ) . map ( e => parseInt( e ) ) ;

    // Extract the height 'h' from the parsed array.
    const h    = hwab . shift ( ) ;
    // Extract the width 'w' from the parsed array.
    const w    = hwab . shift ( ) ;
    // Extract parameter 'a' from the parsed array.
    const a    = hwab . shift ( ) ;
    // Extract parameter 'b' from the parsed array.
    const b    = hwab . shift ( ) ;


    // Case 1: If parameter 'b' is zero.
    // This implies a specific pattern where 'a' ones are followed by 'w-a' zeros, repeated 'h' times.
    if ( b === 0 )
    {
        let str = ""; // Initialize an empty string to build each row's pattern.
        // Loop 'w' times to construct a single row string.
        for ( let i = 0 ; i < w ; i ++ )
        {
            if ( i < a )
            {
                str += "1" ; // Append '1' if the current column index is less than 'a'.
            }
            else
            {
                str += "0" ; // Otherwise, append '0'.
            }
        }
        // Now, repeat this constructed string 'h' times.
        for ( let i = 0 ; i < h ; i ++ )
        {
            console . log ( str ) ; // Print the generated row string.
        }
    }
    // Case 2: If parameter 'a' is zero.
    // This implies a pattern where 'b' rows of all zeros are followed by 'h-b' rows of all ones.
    else if ( a === 0 )
    {
        let str0 = "" ; // String for a row of all zeros.
        let str1 = "" ; // String for a row of all ones.

        // Construct the full '0' string and '1' string for the width 'w'.
        for ( let i = 0 ; i < w ; i ++ )
        {
            str0 += "0" ; // Append '0' for str0.
            str1 += "1" ; // Append '1' for str1.
        }

        // Loop 'h' times to print the rows based on 'b'.
        for ( let i = 0 ; i < h ; i ++ )
        {
            // If the current row index is less than 'b', print the all-zeros string.
            if ( i < b )
            {
                console . log ( str0 ) ;
            }
            // Otherwise, print the all-ones string.
            else
            {
                console . log ( str1 ) ;
            }
        }
    }
    // Case 3: A special condition check.
    // If the product of height and 'a' does not equal the product of width and 'b',
    // it's an invalid configuration for the pattern.
    else if ( h * a !== w * b )
    {
        console . log ( "No" ) ; // Output "No" to indicate an impossible pattern.
    }
    // Case 4: General case where a and b are non-zero, and the products match.
    else
    {
        // Sub-case 4.1: If 'w' is perfectly divisible by 'a'.
        // This suggests a simpler repeating block pattern.
        if ( w % a === 0 )
        {
            // Iterate through each row from 0 to h-1.
            for ( let i = 0 ; i < h ; i ++ )
            {
                let str = "" ; // Initialize string for the current row.

                /*
                 * Calculate 'curLoop': This determines which 'block' of the pattern
                 * the current row 'i' belongs to. It's based on 'b'.
                 */
                const curLoop = Math . floor ( i / b ) ;

                // Iterate through each column from 0 to w-1 to build the row string.
                for ( let j = 0 ; j < w ; j ++ )
                {
                    // Check if the current column 'j' falls within the active '1' block.
                    // The '1' block starts at `curLoop * a` and ends before `(curLoop + 1) * a`.
                    if ( j >= curLoop * a && j < ( curLoop + 1 ) * a )
                    {
                        str += "1" ; // Append '1' for an active cell.
                    }
                    else
                    {
                        str += "0" ; // Append '0' for an inactive cell.
                    }
                }
                console . log ( str ) ; // Print the completed row string.
            }
        }
        // Sub-case 4.2: If 'w' is not perfectly divisible by 'a'.
        // This implies a more complex, wrapping pattern for the '1's.
        else
        {
            // Iterate through each row.
            for ( let i = 0 ; i < h ; i ++ )
            {
                let str = "" ; // String to build for the current row.

                // Determine if the '1's pattern for this row wraps around.
                // This happens if the end of the '1' block (relative to 'w') exceeds 'w'.
                if ( ( i * a % w ) + a >= w )
                {
                    // Pattern wraps around.
                    for ( let j = 0 ; j < w ; j ++ )
                    {
                        // '1's are either from the start of the block to the end of the row,
                        // OR from the beginning of the row up to the wrapped part.
                        if ( j >= ( i * a % w ) || j < ( ( i + 1 ) * a % w ) )
                        {
                            str += "1" ;
                        }
                        else
                        {
                            str += "0" ;
                        }
                    }
                }
                else
                {
                    // Pattern does not wrap around.
                    for ( let j = 0 ; j < w ; j ++ )
                    {
                        // '1's are in a continuous block.
                        if ( j >= ( i * a % w ) && j < ( ( i + 1 ) * a % w ) )
                        {
                            str += "1" ;
                        }
                        else
                        {
                            str += "0" ;
                        }
                    }
                }
                console . log ( str ) ; // Output the generated row.
            }
        }
    }
}
// This line below is for standard input/output handling and should not be modified.
// It reads the entire standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;