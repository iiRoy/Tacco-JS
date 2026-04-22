/*
 * This is a Type I clone of the original JavaScript code.
 *
 * The purpose is to demonstrate that the code fragments are exactly equal,
 * except for variations in whitespace and comments.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Extensive changes in whitespace and comments have been made
 * to make the result visually distinct from the original.
 */

// Define the main function that processes the input
function Main(  input  )

{
    // Split the input string by newline characters
    input = input.split( "\n" );

    // Extract the first line and split it by space to get initial parameters
    var line = input[0].split( " " );

    // Parse integer values for 'num', 'hi', and 'lo' from the first line
    var num = parseInt( line[0] ); // Total number of enemies
    var hi = parseInt( line[1] );  // High damage per hit
    var lo = parseInt( line[2] );  // Low damage per hit

    // Initialize variables for tracking the maximum HP and its index
    var maxHP = 0;       // Stores the maximum HP found among enemies
    var maxInd = 0;      // Stores the index of the enemy with max HP

    // Declare an array to store enemy HP values
    var enm = [];

    // Initialize counters and results
    var killcount = 0; // This variable is declared but not used in the provided logic.
    var ans = 0;       // The final answer, representing the number of hits.


    // Loop through the input to populate the enemy HP array
    // and find the enemy with the highest HP.
    for ( var i = 0 ; i < num ; i++ )
    {
        // Parse enemy HP from subsequent lines of input
        enm[i] = parseInt( input[i+1] );

        // Check if the current enemy's HP is greater than the current maxHP
        if ( enm[i] > maxHP )
        {
            // Update maxHP and maxInd if a new maximum is found
            maxHP = enm[i];
            maxInd = i;
        }
    }


    // The following commented lines are from the original code.
    // They are left here to demonstrate comment preservation/modification.
    //    console.log(maxHP+" "+maxInd);


    // Calculate an initial 'max' boundary for the binary search-like approach.
    // This represents the maximum possible hits if only 'lo' damage is applied.
    var max = Math.ceil( maxHP / ( lo ) );

    // Initialize 'min' boundary for the search.
    var min = 0;

    // Temporary variable for swapping or comparison during the search.
    var temp = 0;

    // Initial guess for the answer ('ans'), based on half of 'lo' damage.
    ans = Math.ceil( maxHP / ( 2 * lo ) );

    // Calculate the base damage dealt by 'ans' hits at 'lo' damage.
    var basedamage = ans * lo;

    // Flag to limit the number of iterations in the while loop.
    var flag = 0;

    // Variable to accumulate extra hits needed.
    var extra = 0;

    // Begin a loop that performs a binary search-like optimization
    // to find the minimum number of hits ('ans').
    while ( 1 )
    {
        flag++; // Increment the iteration counter.

        // Recalculate base damage for the current 'ans' guess.
        basedamage = ans * lo;

        // Iterate through all enemies to determine 'extra' hits needed.
        for ( var i = 0 ; i < num ; i++ )
        {
            // If an enemy's HP is greater than the base damage,
            // calculate how many extra 'hi - lo' hits are required.
            if ( enm[i] > basedamage )
            {
                extra += Math.ceil( ( enm[i] - basedamage ) / ( hi - lo ) );
            }
        }

        // Another commented line from the original.
        // Uncommented here for illustration of modification.
        // console.log("max:"+max+" min:"+min+" ans:"+ans+" extra:"+extra+" temp:"+temp);


        // Adjust the search range based on whether 'extra' hits
        // are more or less than the current 'ans' guess.
        if ( extra > ans )
        {
            // If extra hits are more, the current 'ans' is too low.
            // Shift the 'min' boundary up.
            temp = ans;
            ans = Math.ceil( ( max + ans ) / 2 );
            min = temp;

        }
        else if ( extra < ans )
        {
            // If extra hits are less, the current 'ans' might be too high.
            // Shift the 'max' boundary down.
            temp = ans;
            ans = Math.ceil( ( min + ans ) / 2 );
            max = temp;
        }
        else
        {
            // If extra hits exactly match 'ans', we've found the optimal value.
            break;
        }

        // If 'ans' hasn't changed from the previous iteration,
        // it means we've converged or are stuck, so break.
        if ( ans === temp )
        {
            break;
        }


        // Safety break to prevent infinite loops in case of floating point issues
        // or edge cases where convergence is slow.
        if ( flag > 100 )
        {
            break;
        }

        // Reset 'extra' for the next iteration of the while loop.
        extra = 0;

    } // End of while loop.

    // Output the final calculated answer.
    console.log( ans );

} // End of Main function.


// Call the Main function with input read from stdin.
// This part remains identical as it's outside the direct function body.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );