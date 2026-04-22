'use strict' ; /* This directive enforces strict parsing and error handling in the script. */


function Main  ( input )
{
    // The input string is processed:
    // 1. Trimmed to remove leading/trailing whitespace.
    // 2. Split by newline characters to get an array of lines.
    // 3. The first line (index 0) is selected.
    // 4. Converted to a numeric type and assigned to the constant K.
    const   K   =   Number(   input.trim( ) .split( '\n' ) [ 0 ]   ) ;

    // Output the value of K to the standard console.
    console . log ( K ) ;


    // Define an array containing digits that, if found as the last digit of K,
    // indicate a specific condition.
    const   exclusion   =   [   0,   2,   4,   5,   6,   8   ]   ;

    // Iterate through each digit in the 'exclusion' array.
    for   (   const   ex   of   exclusion   )
    {
        // Check if the last digit of K (obtained using the modulo operator)
        // is strictly equal to the current 'exclusion' digit.
        if   (   K   %   10   ===   ex   )
        {
            // If a match is found, print '-1' to the console.
            console.log( '-1' ) ;
            // Immediately terminate the function execution.
            return  ;
        }
    }

    /*
     * The following code block is commented out in the original source.
     * It appears to be an incomplete or experimental loop structure.
     * The Japanese comment "1の位が1, 3, 7, 9" translates to
     * "The unit's digit is 1, 3, 7, 9".
     * This suggests a potential future logic involving the last digit.
     */
    // for ( let i = 0 ; i < K ; i ++ ) {
    //     if ( ( K * i ) % 10 !== 7 ) continue ;
    // }


    // This return statement signifies the successful completion of the Main function
    // if none of the exclusion conditions were met.
    return  ;
}


// This line initiates the program by calling the Main function.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string
// using Node.js's 'fs' (file system) module and passes it as the 'input' argument.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;