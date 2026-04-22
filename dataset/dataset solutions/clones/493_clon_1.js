/*
 * This JavaScript program processes input data from standard input.
 * It appears to be solving a dynamic programming problem related to probabilities
 * or state transitions.
 *
 * The input format is expected to be:
 * - A line containing three numbers (x, y, z) representing problem parameters.
 * - If x, y, z are all zero, the program terminates.
 * - A line containing 'x' numbers (v array).
 * - 'z' lines, each with three numbers defining 'nea' entries.
 *
 * This version is a Type I clone, meaning it's identical in functionality
 * but extensively modified in whitespace and comments to appear visually different.
 */
var input=  require ( 'fs' )  .  readFileSync (  '/dev/stdin'  ,  'utf8'  ) ; // Read all input from stdin, encoded as UTF-8.

var arr  =  input.trim().split( "\n" ) ; // Trim whitespace and split the input into an array of lines.

// Main processing loop: Continues until a specific termination condition is met.
while (  true  )
{
    // Parse the first line of the current problem instance.
    var xyz = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    /*
     * Check for the termination condition: if x, y, and z are all zero.
     * The join(" ") method reconstructs the string "0 0 0" for comparison.
     */
    if (  xyz . join (  " "  )  ==  "0 0 0"  )
    {
        break ; // Exit the while loop if the termination condition is met.
    }


    // Extract individual parameters for the current problem.
    var x = xyz [ 0 ] ; // Parameter 'x'
    var y = xyz [ 1 ] ; // Parameter 'y'
    var z = xyz [ 2 ] ; // Parameter 'z'


    // Read the next line which contains the 'v' array elements.
    var v = arr . shift ( ) . split ( " " ) . map ( Number ) ;



    // Initialize an array 'nea' to store special conditions or transitions.
    var nea = [ ] ;

    // Populate the 'nea' array based on 'z' subsequent input lines.
    for (  var i = 0  ;  i < z  ;  i ++  )
    {
        // Each line for 'nea' contains three numbers.
        var Z = arr . shift ( ) . split ( " " ) . map ( Number ) ;
        // Store the second and third numbers at the index specified by the first number.
        nea [ Z [ 0 ] ] = [ Z [ 1 ] , Z [ 2 ] ] ;
    }

    /*
     * Initialize the dynamic programming table 'dp'.
     * 'dp' will store probabilities or counts for different states.
     * The outer dimension goes up to 'y', and the inner up to 5000.
     */
    var dp = [ ] ;

    for (  var i = 0  ;  i <= y  ;  i ++  )
    {
        dp [ i ] = [ ] ; // Initialize the inner array for each 'i'.

        for (  var j = 0  ;  j <= 5000  ;  j ++  )
        {
            dp [ i ] [ j ] = 0 ; // Set all initial values to zero.
        }
    }

    // Set the base case for the DP: initial state has a probability of 1.
    dp [ 0 ] [ 0 ] = 1 ;

    /*
     * Main dynamic programming calculation loop.
     * This iterates through possible states and transitions.
     * 'i' represents the current 'y' state.
     * 'k' represents the current secondary state (up to 5000).
     * 'j' iterates through elements of the 'v' array.
     */
    for (  var i = 0  ;  i < y  ;  i ++  )
    {
        for (  var k = 0  ;  k <= 5000  ;  k ++  )
        {
            for (  var j = 0  ;  j < x  ;  j ++  )
            {
                // Calculate the 'after' state, ensuring it doesn't exceed 'y'.
                var after = Math . min ( y , i + v [ j ] ) ;

                // Check if there's a special condition defined for this 'after' state in 'nea'.
                if (  nea [ after ]  !=  undefined  )
                {
                    // Extract the type of event 'e' and its associated value 'a'.
                    var e = nea [ after ] [ 0 ] ;
                    var a = nea [ after ] [ 1 ] ;

                    // Apply the specific transition based on the event type 'e'.
                    if (  e  ==  1  ) // Event type 1: Adjust 'after' state and add to 'k'
                    {
                        dp [ Math . min ( y , after + a ) ] [ k ]  +=  dp [ i ] [ k ]  /  x ;
                    }
                    else if (  e  ==  2  ) // Event type 2: Adjust 'k' state (increase)
                    {
                        dp [ after ] [ Math . min ( 5000 , k + a ) ]  +=  dp [ i ] [ k ]  /  x ;
                    }
                    else if (  e  ==  3  ) // Event type 3: Adjust 'k' state (decrease)
                    {
                        dp [ after ] [ Math . max ( 0 , k - a ) ]  +=  dp [ i ] [ k ]  /  x ;
                    }
                }
                else
                {
                    // No special condition, simply transition to the 'after' state.
                    dp [ after ] [ k ]  +=  dp [ i ] [ k ]  /  x ;
                }
            }
        }
    }

    // Calculate the weighted sum of the final states (when 'i' reaches 'y').
    var sum = 0 ;

    for (  var i = 0  ;  i <= 5000  ;  i ++  )
    {
        sum  +=  i  *  dp [ y ] [ i ] ; // Sum up (index * probability) for the final 'y' state.
    }

    // Output the floor of the calculated sum to the console.
    console . log ( Math . floor ( sum ) ) ;
} // End of the main while loop for problem instances.