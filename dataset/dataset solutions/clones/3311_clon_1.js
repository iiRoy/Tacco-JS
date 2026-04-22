/*
 * Main function definition.
 * This function processes the input to find the longest common subsequence.
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input ) {


    // Process the input string: trim whitespace, split into lines,
    // then split each line by space.
    input = input
        .trim()
        .split( "\n" )
        .map(
            function ( x ) {
                return x.split( " " )
            }
        )
    ;


    // Extract string 's' from the first line of input.
    let s = input[ 0 ][ 0 ].split( "" ) ;

    // Extract string 't' from the second line of input.
    let t = input[ 1 ][ 0 ].split( "" ) ;


    /*
     * Initialize a 2D array (dynamic programming table) for LCS calculation.
     * `arr_dp[j][i]` will store the length of the LCS of `t[0...j-1]` and `s[0...i-1]`.
     */
    var arr_dp = [ ] ;

    // Initialize the first column of the DP table.
    // Represents LCS with an empty string 's'.
    for ( var j = 0 ; j <= t.length ; j++ ) {

        arr_dp . push ( [ ] ) ;
        arr_dp [ j ] [ 0 ] = 0 ;
    }

    // Initialize the first row of the DP table.
    // Represents LCS with an empty string 't'.
    for ( var i = 0 ; i <= s.length ; i++ ) {
        arr_dp [ 0 ] [ i ] = 0 ;
    }


    // Fill the DP table using the standard LCS algorithm.
    for ( var j = 0 ; j < t.length ; j++ ) {
        for ( var i = 0 ; i < s.length ; i++ ) {

            /*
             * If the characters match, extend the LCS from the diagonal.
             */
            if ( s[ i ] === t[ j ] ) {
                arr_dp[ j + 1 ][ i + 1 ] = arr_dp[ j ][ i ] + 1 ;
            }
            /*
             * If characters do not match, take the maximum from the
             * cell above or the cell to the left.
             */
            else {
                arr_dp[ j + 1 ][ i + 1 ] = Math . max (
                    arr_dp[ j + 1 ][ i ] ,
                    arr_dp[ j ][ i + 1 ]
                ) ;
            }
        }
    }


    // The length of the longest common subsequence is stored in the bottom-right cell.
    let l = arr_dp[ t.length ][ s.length ] ;


    // Variables for reconstructing the LCS.
    let tmpLocation1 = t.length ; // Current row index in DP table (for string t)
    let tmpLocation2 = s.length ; // Current column index in DP table (for string s)

    let tmpCharacter ; // Stores the character found for the LCS.

    let v_ans = [ ] ; // Array to store the characters of the LCS.


    /*
     * Backtrack through the DP table to reconstruct the LCS.
     * We iterate 'l' times, where 'l' is the length of the LCS.
     */
    for ( let i = 0 ; i < l ; i++ ) {

        /*
         * Find the column where the LCS length increased.
         * This means s[tmpLocation2 - 1] was part of the LCS.
         */
        for ( let j = tmpLocation2 ; j >= 1 ; j-- ) {

            if ( arr_dp[ tmpLocation1 ][ j ] > arr_dp[ tmpLocation1 ][ j - 1 ] ) {
                tmpLocation2 = j - 1 ;
                break ; // Found the column, move to the next step.
            }
        }

        // The character at the identified position in 's' is part of the LCS.
        tmpCharacter = s[ tmpLocation2 ] ;

        /*
         * Find the row where the LCS length increased,
         * corresponding to the character found.
         */
        for ( let j = tmpLocation1 ; j >= 1 ; j-- ) {

            // If the character in 't' matches the found character,
            // it's part of the LCS.
            if ( t[ j - 1 ] === tmpCharacter ) {

                v_ans . push ( tmpCharacter ) ; // Add to the answer.
                tmpLocation1 = j - 1 ;         // Move up the row.
                break ;                        // Found the row, move to the next character in LCS.
            }
        }
    }


    // Reverse the collected characters and join them to form the final LCS string.
    console . log ( v_ans . reverse ( ) . join ( "" ) ) ;

} /* End of Main function */


// Read input from standard input and pass it to the Main function.
Main (
    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;