/* This function receives the entire input data as a parameter. */


function   Main   (   input   )
{
    // Initialize the topping counter.
    var   toping   =   0   ;

    /*
     * Iterate through the first three characters of the input.
     * The input is expected to be an array-like structure.
     */
    for   (   var   i   =   0   ;
            i   <   3   ;
            i   ++   )
    {
        // Check if the current character is 'o'.
        if   (   input   [   i   ]   ==   'o'   )
        {
            // If 'o' is found, add 100 to the topping score.
            toping   =   toping   +   100   ;
        }
    }


    /*
     * Output the final calculated score.
     * A base score of 700 is added to the topping score.
     */
    console   .   log   (   toping   +   700   )   ;
}


/* DO NOT MODIFY THE FOLLOWING LINE(S): Standard input/output handling. */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;