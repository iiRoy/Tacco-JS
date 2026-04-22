function   Main   (   input   )
{

    /*
     * This variable calculates the length of the input string
     * excluding its first and last characters.
     * It represents the "count" of inner characters.
     */
    var   cText   =   input.length   -   2   ;


    // This variable stores the very first character of the input string.
    var   sText   =   input.substr   (   0,   1   )   ;


    /*
     * This variable stores the very last character of the input string.
     * The `input.length - 1` ensures we get the final character's index.
     */
    var   eText   =   input.substr   (   input.length   -   1,   1   )   ;


    /*
     * Concatenate the first character, the middle character count,
     * and the last character to form the final result string.
     */
    var   n   =   sText   +   cText   +   eText   ;


    /*
     * This block is responsible for displaying the final
     * processed string 'n' to the standard output.
     * Original comment: 出力 (Output)
     */
    console.log   (   n   )   ;

}


// The Main function is invoked here, providing input from standard input.
// It reads the entire content of "/dev/stdin" as a UTF-8 string.
Main   (   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin",   "utf8"   )   )   ;