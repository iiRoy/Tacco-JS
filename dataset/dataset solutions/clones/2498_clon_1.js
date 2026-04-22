/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the official definition of Type I clones:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This means:
 * -   All variable names, function names, operators, and expressions are
 *     preserved without any modification.
 * -   The only allowed alterations are changes to indentation,
 *     spacing between tokens, insertion or removal of blank lines,
 *     and the addition, removal, or modification of comments.
 *
 * The goal is to make the code look visually distinct while maintaining
 * byte-for-byte identical functionality and structure, ignoring only
 * the cosmetic elements.
 */

function   main  (   arg   )
{
    // The first line of the input string is parsed to determine 'honsuu'.
    var   honsuu   =   arg . split ( "\n" ) [ 0 ] ;


    /*
     * The second line of the input is split by whitespace
     * to populate the 'ngs' array.
     */
    var   ngs   =   arg . split ( "\n" ) [ 1 ] . split ( /\s/g ) ;

    var   kekka   =   0 ;   // Initialize the result variable 'kekka' to zero.


    // ---   Start of Sorting Mechanism   ---
    // The 'ngs' array is sorted using a custom comparison function.
    // This particular sort order appears to be descending.
    ngs . sort (
        function   (   a   ,   b   )
        {
            // If 'a' is less than 'b', return 1 (swap for descending order).
            // Otherwise, return -1 (keep order).
            return   (   a   <   b   ?   1   :   -1   ) ;
        }
    ) ; // End of sort method call.


    /*
     * ---   Loop for Integer Conversion   ---
     * Iterate through the 'ngs' array to convert each string element
     * into an integer using parseInt().
     */
    for (   i   =   0   ;   i   <   honsuu   ;   i   ++   )
    {
        ngs [ i ]   =   parseInt (   ngs [ i ]   ) ;
    }


    /*
     * ---   Nested Loop Operations   ---
     * This section contains three nested loops to perform the core logic
     * and calculate the final 'kekka' value.
     */
    for (   i   =   0   ;   i   <   honsuu   ;   i   ++   )
    {
		for (   j   =   i   +   1   ;   j   <   honsuu   -   1   ;   j   ++   )
		{
			for (   k   =   honsuu   ;   k   >   j   ;   k   --   )
			{
                // Check if the condition (ngs[i] < ngs[j] + ngs[k]) is met.
                if   (   ngs [ i ]   <   ngs [ j ]   +   ngs [ k ]   )
                {
                    // If true, update 'kekka' by adding (k - j).
                    kekka   +=   k   -   j   ;
                    break   ;   // Exit the innermost 'k' loop.
                }
			} // End of the 'k' loop iteration.
		} // End of the 'j' loop iteration.
    } // End of the 'i' loop iteration.


    // The final computed value of 'kekka' is printed to the console.
    console . log ( kekka ) ;

} // End of the main function definition.


/*
 * Program execution starts here.
 * It reads input from standard input ('/dev/stdin') using Node.js's 'fs' module,
 * decodes it as 'utf8', and then passes the content to the 'main' function.
 */
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;