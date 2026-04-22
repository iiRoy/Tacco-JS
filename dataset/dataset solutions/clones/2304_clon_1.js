/*
 * This function calculates all permutations of 'k' elements chosen from a set of 'n' distinct elements.
 * It builds permutations iteratively.
 * @param {number} n - The total number of distinct elements available.
 * @param {number} k - The number of elements to choose for each permutation.
 * @returns {Array<Array<number>>} An array of arrays, where each inner array is a permutation.
 */
function   permutation   ( n , k )
{
    // Initialize 'ret' with an empty array, representing the starting point for permutations of length 0.
    var   ret   =   [   [ ]   ]   ;

    // Declare 'next' to hold permutations of the current length being built.
    var   next   ;


    // Loop 'k' times to build permutations of length 1, then 2, up to 'k'.
    for   ( var   i   =   0   ;   i   <   k   ;   i ++   )
    {
        // Reset 'next' for each iteration to store new permutations.
        next   =   [ ]   ;


        // Iterate over each existing permutation in 'ret'.
        ret . forEach ( e =>
        {
            // For each element 'k_val' from 1 to 'n'... (Note: 'k' is reused here for loop variable, bad practice but must be kept)
            for   ( var   k_val   =   1   ;   k_val   <=   n   ;   k_val ++   )
            {
                // Check if the current element 'k_val' is not already present in the permutation 'e'.
                if   (   ! e . includes ( k_val )   )
                {
                    // If not present, append 'k_val' to 'e' and add the new permutation to 'next'.
                    next . push ( e . concat ( [ k_val ] ) )   ;
                }
            }
        } )   ;


        // Update 'ret' with the newly generated permutations for the next iteration.
        // Using concat([]) creates a shallow copy, effectively moving elements from 'next' to 'ret'.
        ret   =   next . concat ( [ ] )   ;
    }

    // Return the final array of permutations.
    return   ret   ;
}


/*
 * Main function to process input and calculate the total score based on a game logic.
 * Reads game parameters and a sequence of moves, then applies scoring rules.
 * @param {string} input - The raw input string, typically from standard input.
 */
function   Main   ( input )
{
    // Split the input string by newline characters into an array of lines.
    input   =   input . split ( "\n" )   ;

    // Check if the last line is empty (common when input ends with a newline).
    if   ( input [ input . length - 1 ]   ===   '' )
    {
        // If it is, remove it from the array.
        input . pop ( )   ;
    }


    // Parse game parameters from the first line of input.
    // N: Total number of moves.
    const   N   =   input [ 0 ] . split ( ' ' ) [ 0 ]   -   0   ;
    // K: Periodicity for checking previous moves.
    const   K   =   input [ 0 ] . split ( ' ' ) [ 1 ]   -   0   ;

    // Parse scoring values from the second line of input.
    // R: Score for winning against 's' (scissors).
    const   R   =   input [ 1 ] . split ( ' ' ) [ 0 ]   -   0   ;
    // S: Score for winning against 'p' (paper).
    const   S   =   input [ 1 ] . split ( ' ' ) [ 1 ]   -   0   ;
    // P: Score for winning against 'r' (rock).
    const   P   =   input [ 1 ] . split ( ' ' ) [ 2 ]   -   0   ;


    // T: The sequence of opponent's moves (rock 'r', scissors 's', paper 'p') from the third line.
    const   T   =   input [ 2 ]   ;


    // Initialize total score.
    var   ans   =   0   ;

    // Create an array to track if a move at a certain index has been "passed" (i.e., blocked due to periodicity).
    var   passed   =   new   Array ( N )   ;

    // Initialize all elements of the 'passed' array to false.
    passed . fill ( false )   ;


    // Iterate through each of the opponent's moves.
    for   ( var   i   =   0   ;   i   <   T . length   ;   i ++   )
    {
        // Check for the special condition:
        // If 'i' is at least 'K' positions into the game,
        // AND the current move is the same as the move 'K' positions ago,
        // AND the move 'K' positions ago was NOT already passed/blocked.
        if   (   i   >=   K   &&   T [ i ]   ===   T [ i - K ]   &&   ! passed [ i - K ]   )
        {
            // If all conditions met, this current move is considered "passed" or blocked.
            // Mark it as passed.
            passed [ i ]   =   true   ;

            // Skip to the next iteration as no score is awarded for a passed move.
            continue   ;
        }

        // Determine the score based on the opponent's current move.
        switch   ( T [ i ] )
        {
            case   'r'   :   // Opponent played Rock
                ans   +=   P   ;   // Win with Paper (P score)
                break   ;

            case   's'   :   // Opponent played Scissors
                ans   +=   R   ;   // Win with Rock (R score)
                break   ;

            case   'p'   :   // Opponent played Paper
                ans   +=   S   ;   // Win with Scissors (S score)
                break   ;
        }
    }

    // Output the final calculated total score to the console.
    console . log ( ans )   ;
}


/*
 * This is a crucial section for competitive programming environments.
 * It ensures the Main function is called with input from standard input.
 * DO NOT EDIT THIS LINE OR BELOW.
 * The input is read synchronously from /dev/stdin (common in Unix-like systems).
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) )   ;