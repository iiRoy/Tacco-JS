/*
 * This is a JavaScript file.
 * It strictly adheres to modern JavaScript standards.
 * The purpose of this script is to validate a sequence of words
 * based on specific conditions, akin to a Shiritori game.
 */

'use strict'; /* Enforces strict mode for cleaner code and fewer errors. */


/**
 * The main function that processes the input and determines the validity of the word sequence.
 *
 * @param {string} INPUT - The raw input string containing the number of words and the words themselves,
 *                         separated by newlines.
 */
const main = ( INPUT ) => {

    /*
     * Split the entire input string by newline characters
     * to get an array where each element is a line from the input.
     */
    const input = INPUT . split ( '\n' ) ;

    /*
     * The first line of the input contains the expected number of unique words (N).
     * Convert this string to a number.
     */
    const N = Number ( input [ 0 ] ) ;

    /*
     * Remove the first element (which was 'N') from the 'input' array.
     * Now, 'input' only contains the words themselves.
     */
    input . shift ( ) ;


    /*
     * Create a temporary array 'tmp' by filtering the 'input' array.
     * This filter operation effectively removes duplicate words,
     * ensuring that each word in 'tmp' is unique.
     * The condition `self.indexOf(x) === i` checks if the current element's
     * first occurrence is at its current index, meaning it's not a duplicate.
     */
    let tmp = input . filter (
        ( x , i , self ) => {
            return self . indexOf ( x ) === i ;
        }
    ) ;


    /*
     * Check the first condition:
     * If the number of unique words found ('tmp.length') is not equal to
     * the expected number of words (N), then the sequence is invalid.
     * This implies there were duplicate words when not expected, or the count was off.
     */
    if ( tmp . length != N )
    {
        // Output 'No' and terminate the function.
        console . log ( 'No' ) ;
        return ;
    }
    else
    {
        /*
         * If the first condition passes (all words are unique and count matches N),
         * proceed to check the second condition:
         * Each word must start with the last character of the preceding word.
         * We iterate from the second word (index 1) up to the end of the list.
         */
        for ( let i = 1 ; i < input . length ; i ++ )
        {
            // Get the last character of the previous word (input[i-1]).
            const lastCharOfPreviousWord = input [ i - 1 ] . slice ( -1 ) ;

            // Get the first character of the current word (input[i]).
            const firstCharOfCurrentWord = input [ i ] . slice ( 0 , 1 ) ;

            /*
             * Compare the last character of the previous word with the first character of the current word.
             * If they do not match, the sequence is invalid.
             */
            if ( lastCharOfPreviousWord != firstCharOfCurrentWord )
            {
                // Output 'No' and terminate the function.
                console . log ( 'No' ) ;
                return ;
            }
        }
    }


    /*
     * If all conditions (uniqueness and sequential character matching) are met,
     * then the word sequence is valid.
     */
    console . log ( 'Yes' ) ;

} ; // End of the main function definition.


/*
 * This section handles the execution of the script when run.
 * It reads the input from standard input, decodes it as UTF-8,
 * and then passes it to the 'main' function for processing.
 */
main (
    require ( 'fs' )
        . readFileSync ( '/dev/stdin' , 'utf8' )
) ;