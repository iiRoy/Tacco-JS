/*
 * This JavaScript function calculates the number of possible paths
 * through an Amidakuji (ladder lottery) grid of size H x W,
 * starting from the leftmost column (index 0) and ending at a
 * specific column K-1 after H steps.
 *
 * It uses dynamic programming to solve the problem.
 */
function         Main (  input    ) {

    // First, process the input string.
    // It's expected to be space-separated numbers.
    // Convert them to integers using the bitwise NOT operator twice (~~).
    input     =     input
                      .split(" ")
                                .map(  a=>~~a  ) ;

    // Extract the dimensions and target column from the processed input.
    var     H      =      input[0] ; // Height of the Amidakuji grid
    var     W      =      input[1] ; // Width of the Amidakuji grid
    var     K      =      input[2] ; // Target column (1-indexed), will be K-1 for 0-indexed arrays

    // Define the modulo constant for calculations to prevent integer overflow.
    var     mod    =      1000000007 ;



    // Handle a special base case: if the width is 1, there's only one path,
    // which is always valid and leads to the only column.
    if  ( W == 1 )
    {
        return    1 ;
    }


    /*
     * Generate a list of all valid Amidakuji bar configurations for a single row.
     * A configuration is valid if no two horizontal bars are adjacent.
     * This is represented by a binary string where '1' means a bar exists
     * between two columns and '0' means no bar.
     *
     * Example: for W=3, bars can be between (0,1) and (1,2).
     *   "00" means no bars.
     *   "01" means bar between (1,2).
     *   "10" means bar between (0,1).
     *   "11" is invalid (adjacent bars).
     */
    var validAmidaList = Array( Math.pow( 2 , ( W - 1 ) ) )
                                      // Create an array of size 2^(W-1)
                                      .fill( 0 )
                                              // Fill with zeros (placeholder)
                                              .map( ( a , b ) => b )
                                                                  // Map to indices (0 to 2^(W-1)-1)
                                                                  .map( a => a.toString( 2 ) )
                                                                                            // Convert each index to its binary string representation
                                                                                            .filter( a => !/11/.test( a ) )
                                                                                                                          // Filter out configurations with adjacent '1's (invalid bars)
                                                                                                                          // This regex `11` checks for two consecutive '1's.
                                                                                                                          .map( a => "000000" + a )
                                                                                                                                                    // Pad with leading zeros to ensure fixed length for slicing
                                                                                                                                                    .map( a => a.slice( 1 - W ) )
                                                                                                                                                                                // Slice to get the correct number of bits (W-1)
                                                                                                                                                                                .map( a => "0" + a + "0" ) ;
                                                                                                                                                                                                          // Add '0' to both ends for easier boundary checking later.
                                                                                                                                                                                                          // This makes a configuration like "010" for W=3 where the middle '1' means a bar.


    // Initialize the dynamic programming table.
    // dp[i][j] will store the number of ways to reach column 'j' at height 'i'.
    var dp     =     Array( H + 1 ) ;

    // Populate each row of the DP table with an array of zeros.
    for ( var    i    =    0 ;    i    <=    H ;    i++    ) {
        dp[i]    =    Array( W ) .fill( 0 ) ;
    }

    // Base case for DP: At height 0, there is 1 way to be in column 0 (the starting point).
    dp[0][0]    =    1 ;


    // Iterate through each height level of the Amidakuji grid.
    for  ( var  i  =  1 ;  i  <=  H ;  i++  )  {

        // For each height, consider every valid Amida bar configuration for the current row.
        validAmidaList.forEach( function( elem ) {

            // For the current Amida configuration, calculate transitions for each column.
            for  ( var  j  =  0 ;  j  <  W ;  j++  )  {

                /*
                 * Determine the previous column based on the Amida bars.
                 * elem[j] represents the bar between column j-1 and j.
                 * elem[j+1] represents the bar between column j and j+1.
                 *
                 * "10": Bar between j-1 and j. If coming from j-1, go to j.
                 * "01": Bar between j and j+1. If coming from j+1, go to j.
                 * "00": No bar at j. If coming from j, stay at j.
                 *
                 * This uses an object literal as a switch-like structure for concise transitions.
                 */
                ( {
                    "10" : a => dp[i][j] += dp[i-1][j-1] , // Moved from column j-1 to j
                    "01" : a => dp[i][j] += dp[i-1][j+1] , // Moved from column j+1 to j
                    "00" : a => dp[i][j] += dp[i-1][j]    // Stayed in column j
                } ) [ elem[j] + elem[j+1] ] ( ) ; // Select the appropriate function and call it

                // Apply modulo operation to keep numbers within bounds.
                dp[i][j] %= mod ;
            }
        } ) ;
    }

    // The final result is the number of ways to reach column K-1 at height H.
    return    dp[H][K-1] ;
}


// This block handles input/output when the script is run in a Node.js environment.
// It checks if 'require' is defined, indicating a Node.js context.
if    ( typeof    require    !==    'undefined'    )
{
    console.log( Main( require("fs").readFileSync("/dev/stdin", "utf8") ) ) ;
}