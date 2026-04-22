function     Main  ( input )   {
    // This is the main function that processes the input string.

    var tmp = input . trim ( ) . split ( '\n' ) ;

    // The first line of input is expected to be a number N.
    var   N   = Number ( tmp [ 0 ] ) ;

    // The second line is the string of characters.
    var   strs   =   tmp [ 1 ] . split ( '' ) ;


    var   cnt   =   0   ; // Initialize a counter variable.


    /*
     * If N is greater than 0, we increment the counter.
     * This handles the case of an empty string or a string with one character.
     */
    if   (   N   >   0   )
    {
        cnt   ++   ;
    }


    /*
     * Iterate through the string to compare adjacent characters.
     * The loop runs from index 0 up to N (inclusive),
     * which covers all characters and allows comparison with strs[i+1].
     */
    for   (   var   i   =   0   ;   i   <=   N   ;   i   ++   )
    {
        // Check if the current character is different from the next one.
        if   (   strs   [   i   ]   !==   strs   [   i   +   1   ]   )
        {
            cnt   ++   ; // Increment counter if they are different.
        }
    }


    // Finally, print the result, which is `cnt - 1`.
    console . log ( cnt   -   1 ) ;

} // End of the Main function definition.


/*
 * This multi-line comment block previously held example input and a
 * commented-out call to Main with that example input.
 * It has been modified to just contain explanatory text.
 * Original example input: `20\nxxzaffeeeeddfkkkkllq`
 * The system will use standard input.
 */


Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the Main function with input from stdin.