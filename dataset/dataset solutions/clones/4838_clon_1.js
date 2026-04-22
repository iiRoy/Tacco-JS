process . stdin . resume ( ) ; // This line resumes the standard input stream.


process   .   stdin   .   setEncoding (   'utf8'   ) ;


/*
 * The entire input data will be stored in the 'input' variable.
 * This is the primary entry point for processing.
 */
function     Main (   input   )
{
    // The first line goes into line1, second into line2, and so on (conceptually).
    var   arg     =     input . split ( "\n" ) ;


    var   line0   =   arg   [   0   ]   .   split   (   " "   )   ;


    /*
     * Parse the first three numbers from the first line of input.
     * These are stored in variables 'a', 'b', and 'c'.
     */
    var   a   =   Number   (   line0   [   0   ]   )   ;
    var   b   =   Number   (   line0   [   1   ]   )   ;
    var   c   =   Number   (   line0   [   2   ]   )   ;



    var   ans   =   "initial_answer"   ; // Default answer before computation.
    // console.log( "[INPUT] "+ input1 +" "+ input2 +" "+ input3 + " " + input4 ); // Debugging input, currently commented out.


    /*
     * L O G I C
     * The core processing logic starts here.
     */
    ans   =   0   ; // Initialize the answer to zero.


    // Loop from 'a' to 'b' (inclusive).
    for   (   var   i   =   a   ;   i   <=   b   ;   i   ++   )
    {
        // console.log(i); // Debugging loop counter, currently commented out.
        // Check if the current number 'i' is perfectly divisible by 'c'.
        if   (   i   %   c   ===   0   )   ans   ++   ; // If divisible, increment the answer.
    }


    // Output the final computed answer to the console.
    console   .   log   (   ans   )   ;

}


// * DO NOT EDIT BELOW THIS LINE (reads input once and calls Main)
Main (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;