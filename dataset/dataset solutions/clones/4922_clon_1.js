const { parse } = require("path"); /* This line imports the 'parse' function from the 'path' module.
                                         * Note: This specific import is present in the original code but not utilized
                                         * within the logic of the Main function as provided.
                                         */

/*
 * This is the primary function responsible for processing the input.
 * It takes a raw input string, parses it, and then applies a specific
 * algorithm to calculate a final result based on a series of conditions.
 *
 * @param {string} input - The raw string input, typically read from standard input.
 */
function Main( input )
{
    // The input string is first trimmed to remove leading/trailing whitespace.
    // Then, it's split into an array of lines based on the newline character.
    // Finally, each line is further split into an array of strings based on spaces.
    input = input . trim ( ) . split ( "\n" ) . map (
        function ( x )
        {
            return x . split ( " " )
        }
    ) ; // End of input preprocessing.

    // Parse the first number from the input as the total count 'N'.
    var N = parseInt ( input [ 0 ] [ 0 ] , 10 ) ;

    // Initialize an empty array to store arrays of 'T' and 'A' values.
    var arr_TA = [ ] ;

    /*
     * This loop populates the 'arr_TA' array.
     * It iterates 'N' times, processing each subsequent line of input.
     * Each line is expected to contain two space-separated numbers,
     * which are parsed as integers and pushed as an array [T, A] into arr_TA.
     */
    for ( var i = 0 ; i < N ; i ++ )
    {
        // For each iteration, take the (i+1)-th line from the processed input.
        // Map its elements (which are strings) to integers and add to arr_TA.
        arr_TA . push ( input [ i + 1 ] . map ( e => parseInt ( e , 10 ) ) ) ;
    }

    // Initialize a temporary array 'tmp' with starting values [0, 0].
    // This array will hold the current 'T' and 'A' values as they are updated.
    var tmp = [ 0 , 0 ] ;

    // Declare a variable 'n'; it will be used for scaling calculations within the main loop.
    var n ;

    /*
     * This is the core logic loop. It iterates through each pair of [T, A]
     * in 'arr_TA' and updates the 'tmp' array based on a set of conditional rules.
     * The goal is to find the smallest common multiple-like pair that satisfies
     * the conditions with the current 'tmp' values.
     */
    for ( var i = 0 ; i < N ; i ++ )
    {
        // Condition 1: If both current T (arr_TA[i][0]) and A (arr_TA[i][1]) are
        // greater than or equal to their respective temporary values (tmp[0], tmp[1]).
        if ( arr_TA [ i ] [ 0 ] >= tmp [ 0 ] && arr_TA [ i ] [ 1 ] >= tmp [ 1 ] )
        {
            // In this case, simply update 'tmp' to the current [T, A] values.
            tmp = [ arr_TA [ i ] [ 0 ] , arr_TA [ i ] [ 1 ] ] ;
        }
        // Condition 2: If current T is greater or equal, but current A is less than temporary A.
        else if ( arr_TA [ i ] [ 0 ] >= tmp [ 0 ] && arr_TA [ i ] [ 1 ] < tmp [ 1 ] )
        {
            // Calculate 'n' by finding the ceiling of (tmp[1] / arr_TA[i][1]).
            // This ensures arr_TA[i][1] * n is at least tmp[1].
            n = Math . ceil ( tmp [ 1 ] / arr_TA [ i ] [ 1 ] ) ;
            // Update 'tmp' by scaling both current T and A with 'n'.
            tmp = [ arr_TA [ i ] [ 0 ] * n , arr_TA [ i ] [ 1 ] * n ] ;
        }
        // Condition 3: If current T is less, but current A is greater or equal than temporary A.
        else if ( arr_TA [ i ] [ 0 ] < tmp [ 0 ] && arr_TA [ i ] [ 1 ] >= tmp [ 1 ] )
        {
            // Calculate 'n' by finding the ceiling of (tmp[0] / arr_TA[i][0]).
            // This ensures arr_TA[i][0] * n is at least tmp[0].
            n = Math . ceil ( tmp [ 0 ] / arr_TA [ i ] [ 0 ] ) ;
            // Update 'tmp' by scaling both current T and A with 'n'.
            tmp = [ arr_TA [ i ] [ 0 ] * n , arr_TA [ i ] [ 1 ] * n ] ;
        }
        // Condition 4: If both current T and A are less than their respective temporary values.
        else if ( arr_TA [ i ] [ 0 ] < tmp [ 0 ] && arr_TA [ i ] [ 1 ] < tmp [ 1 ] )
        {
            // First, calculate 'n' based on the T values.
            n = Math . ceil ( tmp [ 0 ] / arr_TA [ i ] [ 0 ] ) ;
            // Check if scaling current A with this 'n' also satisfies the A condition (arr_TA[i][1] * n >= tmp[1]).
            if ( arr_TA [ i ] [ 1 ] * n >= tmp [ 1 ] )
            {
                // If it does, 'n' is already correct, so an empty statement is executed.
                ;
            }
            else
            {
                // If not, recalculate 'n' based on the A values instead.
                n = Math . ceil ( tmp [ 1 ] / arr_TA [ i ] [ 1 ] ) ;
            }
            // Update 'tmp' using the final determined 'n' to scale both current T and A.
            tmp = [ arr_TA [ i ] [ 0 ] * n , arr_TA [ i ] [ 1 ] * n ] ;
        }
    }

    // After the loop finishes, print the sum of the two elements in the final 'tmp' array to the console.
    console . log ( tmp [ 0 ] + tmp [ 1 ] ) ;
}

// This line reads the input from standard input (typically /dev/stdin in competitive programming environments).
// The input is read synchronously as a UTF-8 encoded string and then passed to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Function call to initiate the program.