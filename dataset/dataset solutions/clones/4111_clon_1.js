"use strict"
;
//  This script solves a programming challenge related to defeating a monster.
//  It determines the minimum number of attacks required.
//  The monster has H health points.
//  There are N katanas.
//  Each katana has an attack power 'a' (when swung) and a throw power 'b' (when thrown).

const main = arg =>
{
    // Process input data: trim whitespace, split into lines.
    arg = arg.trim() .split("\n") ;

    // Parse N, the number of katanas.
    const N = parseInt( arg[0] .split(" ")[0] ) ;
    // Parse H, the monster's initial health.
    let H = parseInt( arg[0] .split(" ")[1] ) ;

    // Extract katana attack/throw values.
    // Each element `n` is "a b", so we split it.
    const ab = arg .slice(1, N + 1) .map(n=>n.split(" ")) ;


    // Initialize variables for tracking the strongest katana and total throw power.
    let strongestPoint = 0 ; // Stores the highest 'a' (swing attack power) found.
    let strongestIndex = 0 ; // Stores the index of the katana with the highest 'a'.
    let throwSum       = 0 ; // Accumulates the sum of all 'b' (throw attack powers).

    // Iterate through all katanas to find the strongest one and sum throw powers.
    for (let i in ab)
    {
        // Parse 'a' and 'b' for the current katana.
        const a = parseInt( ab[i][0] ) ;
        const b = parseInt( ab[i][1] ) ;

        // Add current katana's throw power to the total sum.
        throwSum += b ;

        // Check if this katana is stronger in terms of swing attack power.
        if (a > strongestPoint)
        {
            // If so, update the strongest katana's index and attack power.
            strongestIndex = i ;
            strongestPoint = a ;
        }
    }

    // Store the strongest katana's [a, b] values for later use.
    let strongestKatana = ab[strongestIndex] ;

    /*
     * First, a quick check:
     * If throwing ALL katanas (including the strongest one) is enough
     * to defeat the monster, then that's the most efficient strategy.
     * In this case, the number of "attacks" is simply N (throwing N katanas).
     */
    if (throwSum >= H)
    {
        console.log(N) ; // Output N and exit.
        return ;
    }


    /*
     * If throwing all katanas isn't enough, we need a different strategy.
     * The general strategy is to throw all katanas that are *not* the strongest
     * (those with lower 'a' values than the strongest one), and then
     * repeatedly swing the strongest katana until the monster is defeated.
     *
     * The reason for this is that katanas with lower 'a' values are
     * less efficient for swinging, so they are best used as one-time throws.
     */
    if (N > 1) // This condition is important: if N=1, we only have one katana.
    {
        // Subtract the throw power of all katanas *except* the strongest one.
        // This simulates throwing all weaker katanas.
        H -= throwSum - parseInt(ab[strongestIndex][1]) ;
    }
    // If N is 1, H remains unchanged here, as there are no "other" katanas to throw.


    // Calculate the remaining HP after throwing the weaker katanas (or none if N=1).
    // Note: The strongest katana's throw power is *not* subtracted here.
    // It will be considered as part of the "swinging" strategy or as its final throw.
    const restHP = H - parseInt(ab[strongestIndex][1]) ;


    /*
     * Now, calculate how many times the strongest katana needs to be swung
     * to defeat the remaining HP. We use Math.ceil because even a tiny
     * sliver of HP requires a full swing.
     */
    const strongestAttacksAndThrow = Math.ceil(restHP / parseInt(ab[strongestIndex][0])) ;


    /*
     * Finally, output the total number of actions.
     * This is the number of times the strongest katana is swung
     * (calculated as `strongestAttacksAndThrow`)
     * plus the number of katanas thrown (which is N-1 if N > 1, or 0 if N=1).
     *
     * If N=1, `strongestAttacksAndThrow` already accounts for the initial throw
     * and subsequent swings of that single katana. So we simply add 1 for the throw.
     *
     * If N > 1, `strongestAttacksAndThrow` represents the swings of the strongest katana,
     * and (N-1) represents the throws of the other katanas.
     */
    console.log(N === 1 ? strongestAttacksAndThrow + 1 : strongestAttacksAndThrow + (N - 1)) ;
}
// Read input from stdin and pass it to the main function.
main( require('fs') .readFileSync('/dev/stdin', 'utf8') ) ;