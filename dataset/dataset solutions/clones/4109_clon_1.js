"use strict" ;

/*
 * This JavaScript module defines a function to solve a specific problem.
 * The goal is to determine the minimum number of actions (katana throws or swings)
 * required to reduce a monster's health (H) to zero or less.
 *
 * Input format:
 * The first line contains two integers: N (number of katanas) and H (monster's health).
 * The following N lines each contain two integers: a (regular attack power) and b (throw damage).
 *
 * Constraints:
 * - Identifiers, variable names, function names, operators, and expressions
 *   must remain exactly as in the original code.
 * - Only whitespace (spaces, tabs, newlines) and comments can be altered.
 * - The visual appearance should be significantly different from the original.
 */


const main = arg =>  {

    // Pre-process the input string: remove leading/trailing whitespace and split into an array of lines.
    arg = arg.trim() . split ("\n");

    // Extract N (number of katanas) and H (initial monster health) from the first line of input.
    // Note: arg[0] is still a string like "N H".
    const N = parseInt( arg[0].split(" ")[0] );
    let H = parseInt( arg[0].split(" ")[1] );

    // Process the remaining lines to get katana attack/throw values.
    // arg.slice(1, N + 1) gets lines from index 1 up to N (inclusive).
    // .map(n => n.split(" ")) transforms each line string (e.g., "a b") into an array of two strings (e.g., ["a", "b"]).
    const ab = arg . slice (1, N + 1) . map (n => n . split (" "));


    // Initialize variables for tracking the strongest regular attack and total throw damage.
    let strongestPoint = 0 ; // Stores the maximum 'a' (regular attack power) found so far.
    let strongestIndex = 0 ; // Stores the array index of the katana with the 'strongestPoint'.
    let throwSum = 0 ;       // Accumulates the total 'b' (throw damage) from all katanas.


    // Iterate through each katana to find the strongest regular attack and sum up all throw damages.
    for (let i in ab) {
        // Parse 'a' (regular attack) and 'b' (throw damage) for the current katana.
        const a = parseInt (ab[i][0]) ;
        const b = parseInt (ab[i][1]) ;

        // Add the current katana's throw damage to the total.
        throwSum += b ;

        // Check if the current katana has a stronger regular attack than previously found.
        if (a > strongestPoint) {
            strongestIndex = i ;       // Update the index of the strongest katana.
            strongestPoint = a ;       // Update the strongest regular attack power.
        }
    }


    // Retrieve the data for the katana identified as having the strongest regular attack.
    let strongestKatana = ab[strongestIndex] ; // This stores ["a_strongest", "b_strongest"] as strings.


    // --- Core Logic for Determining Minimum Actions ---

    // Scenario 1: Check if throwing *all* katanas is sufficient to defeat the monster.
    // This is the most efficient strategy if it works, as it uses N actions (one throw per katana).
    if (throwSum >= H) {
        console.log(N) ; // Output N, indicating all N katanas are thrown.
        return ;         // Terminate execution, as the optimal solution is found.
    }


    // Scenario 2: Throwing all katanas is not enough.
    // We must use the strongest katana's regular attack.
    // To maximize damage from throws while saving the strongest katana for swings:
    // Throw all katanas *except* the strongest one.
    // This step is only relevant if there's more than one katana (N > 1).
    if (N > 1) {
        // Reduce monster's health by the total throw damage of all katanas *excluding* the strongest one.
        // Note: ab[strongestIndex][1] is a string, JavaScript performs implicit type coercion.
        H -= throwSum - ab[strongestIndex][1] ;
    }


    // Calculate the remaining HP that *must* be dealt with by the strongest katana's swings.
    // This `restHP` is the health left after considering that the strongest katana itself might be thrown
    // (its throw damage `ab[strongestIndex][1]` is subtracted here).
    // If N=1, `H` is original `H`. `restHP` becomes `original_H - throw_damage_of_strongest`.
    // If N>1, `H` is `original_H - (sum_of_throw_damages_of_non_strongest)`.
    // So `restHP` becomes `original_H - (sum_of_throw_damages_of_non_strongest) - (throw_damage_of_strongest)`.
    // Effectively, `restHP` is the health remaining after ALL katanas' throw damages are accounted for.
    const restHP = H - ab[strongestIndex][1] ;


    // Determine how many times the strongest katana needs to be swung.
    // We use Math.ceil to ensure any fractional HP remaining is rounded up, requiring a full swing.
    // The `strongestPoint` (ab[strongestIndex][0]) is the 'a' value (regular attack power).
    // If `restHP` is 0 or negative (meaning throws were sufficient), this will correctly yield 0.
    const strongestAttacksAndThrow = Math.ceil (restHP / ab[strongestIndex][0]) ;


    // This `console.log` seems to output the number of swings for the strongest katana.
    // It might be an intermediate debug output or part of a problem variant.
    console.log (strongestAttacksAndThrow) ;


    // Finally, calculate and output the total number of actions taken.
    // The total actions include:
    // - The throws of all katanas *except* the strongest one (if N > 1). This is (N - 1) actions.
    // - The throw of the strongest katana itself (1 action).
    // - The swings of the strongest katana (`strongestAttacksAndThrow` actions).
    //
    // If N = 1: Total actions = (1 throw for the single katana) + (swings of that katana).
    // If N > 1: Total actions = (N-1 throws for other katanas) + (1 throw for strongest katana) + (swings of strongest katana).
    // The expression handles this concisely:
    // - `strongestAttacksAndThrow + 1` for N=1 (1 throw + swings)
    // - `strongestAttacksAndThrow + (N - 1)` for N>1 (N-1 throws + swings, implicitly strongest katana is swung after other N-1 are thrown)
    // The logic here is subtle: if `strongestAttacksAndThrow` is 0, it means all HP was covered by throws,
    // so for N=1, it's 1 action (the throw). For N>1, it's N-1 actions (the throws).
    // This implies `strongestAttacksAndThrow` is only added if swings are actually needed.
    // The N=1 case is `strongestAttacksAndThrow + 1` (1 throw + swings).
    // The N>1 case is `strongestAttacksAndThrow + (N-1)` (N-1 throws + swings).
    console.log(N === 1 ? strongestAttacksAndThrow + 1 : strongestAttacksAndThrow + (N - 1)) ;

} ; // End of the main function definition.


// Entry point of the script: read input from standard input and pass it to the main function.
// `require('fs').readFileSync('/dev/stdin', 'utf8')` reads the entire content of stdin as a UTF-8 string.
main(require('fs') . readFileSync ('/dev/stdin', 'utf8')) ;