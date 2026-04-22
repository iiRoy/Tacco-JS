/*
 * This JavaScript file contains two main functions:
 *   1. `Main`: Processes input data to determine a path feasibility.
 *   2. `debug`: A utility function for testing the `Main` function in a browser-like environment.
 *
 * The core logic is within the `Main` function, which simulates movement
 * on a grid and checks for boundary violations based on a sequence of moves.
 */

// Define the primary function that handles the core logic
function    Main (  input ) {


    // Split the input string into an array of lines
    input =   input . split ( "\n" ) ;

    /*
     * Parse grid dimensions (H, W) and the number of moves (N)
     * from the first line of input.
     */
    var H = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // Grid height
    var W = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // Grid width
    var N = parseInt ( input [ 0 ] . split ( " " ) [ 2 ] ) ; // Number of moves

    // Parse starting row (sr) and column (sc) from the second line
    var sr = parseInt ( input [ 1 ] . split ( " " ) [ 0 ] ) ; // Starting row (1-indexed)
    var sc = parseInt ( input [ 1 ] . split ( " " ) [ 1 ] ) ; // Starting column (1-indexed)

    // Split the move sequences for S and T into character arrays
    var S = input [ 2 ] . split ( "" ) ; // Player's planned moves
    var T = input [ 3 ] . split ( "" ) ; // Opponent's counter-moves

    // Initialize counters for player's cumulative moves
    var l = 0 ; // Left moves
    var r = 0 ; // Right moves
    var u = 0 ; // Up moves
    var d = 0 ; // Down moves

    // Initialize counters for opponent's cumulative counter-moves
    var l2 = 0 ; // Opponent's 'left' counter-moves (effectively increasing right boundary)
    var r2 = 0 ; // Opponent's 'right' counter-moves (effectively increasing left boundary)
    var u2 = 0 ; // Opponent's 'up' counter-moves (effectively increasing down boundary)
    var d2 = 0 ; // Opponent's 'down' counter-moves (effectively increasing up boundary)

    // Initial assumption: the path is possible
    var ans = "YES" ;

    // Loop through each move in the sequence (N total moves)
    for ( var i = 0 ; i < N ; i++ ) {

        // --- Process Player's Move (S[i]) ---
        // Increment respective counter based on the current move S[i]
        if ( S [ i ] == "L" ) {
            l++ ;
        }
        if ( S [ i ] == "R" ) {
            r++ ;
        }
        if ( S [ i ] == "U" ) {
            u++ ;
        }
        if ( S [ i ] == "D" ) {
            d++ ;
        }

        // --- Check Boundary Conditions after Player's Move ---
        // If current position + right moves exceeds grid width
        if ( r + sc > W ) {
            ans = "NO" ; // Path is impossible
            break ;      // Exit the loop early
        }
        // If current position - left moves goes below 1
        if ( sc - l <= 0 ) {
            ans = "NO" ;
            break ;
        }
        // If current position + down moves exceeds grid height
        if ( d + sr > H ) {
            ans = "NO" ;
            break ;
        }
        // If current position - up moves goes below 1
        if ( sr - u <= 0 ) {
            ans = "NO" ;
            break ;
        }

        // --- Process Opponent's Counter-Move (T[i]) ---
        /*
         * The opponent's moves effectively shift the *boundaries* that the player
         * must stay within. The conditions (e.g., `sc+r2+1<=W`) check if the
         * opponent's move can actually be applied without immediately making
         * the player's path invalid.
         */
        if ( T [ i ] == "R" && sc + r2 + 1 <= W ) {
            l-- ;  // Opponent moving right makes player's 'left' boundary more lenient
            r2++ ; // Increment opponent's right counter
        }
        if ( T [ i ] == "L" && sc - l2 - 1 > 0 ) {
            r-- ;  // Opponent moving left makes player's 'right' boundary more lenient
            l2++ ; // Increment opponent's left counter
        }
        if ( T [ i ] == "U" && sr - u2 - 1 > 0 ) {
            d-- ;  // Opponent moving up makes player's 'down' boundary more lenient
            u2++ ; // Increment opponent's up counter
        }
        if ( T [ i ] == "D" && sr + d2 + 1 >= H ) { // Note: original code had `>=H` here, not `<H`
            u-- ;  // Opponent moving down makes player's 'up' boundary more lenient
            d2++ ; // Increment opponent's down counter
        }
    }


    // Output the final answer (YES or NO) to the console
    console . log ( '%s' , ans ) ;
    // Return the answer
    return ans ;
}

// Debugging function for a specific input scenario (e.g., in a browser context)
function debug ( n ) {
    // Retrieve input value from a specific HTML element
    var input = document . getElementById ( "input" + n ) . value ;
    // Call the main logic function with the retrieved input
    var ans = Main ( input ) ;
    // Initialize result as "Wrong Answer"
    var result = "WA" ;
    // Compare the computed answer with the expected output from another HTML element
    if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] ) {
        result = "AC" ; // If they match, set result to "Accepted"
    }
    // Update the result display in the corresponding HTML element
    document . getElementById ( "result" + n ) . innerHTML = result ;
}

// This line executes the Main function with input read from standard input
// It's common in competitive programming environments for Node.js
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;