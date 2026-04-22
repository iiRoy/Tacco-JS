/* This is a Type I clone generated from an original JavaScript snippet.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered significantly. */


function   Main  (  input  )
{
    // Declare a temporary variable to store split input parts.
    var   tmp   =   input  .  split (  " "  )  ;

    // Parse the first part of the input as an integer for N, using base 10.
    var   N   =   parseInt (  tmp  [  0  ]  ,  10  )  ;

    // Parse the second part of the input as an integer for M, using base 10.
    var   M   =   parseInt (  tmp  [  1  ]  ,  10  )  ;


    // --- Combinatorics Logic Explanation ---
    // The problem seems to be about counting pairs of numbers (balls) that sum to an even number.
    // Let's analyze the parity combinations:
    // 1. Even + Even = Even (Counted as case 1)
    // 2. Odd  + Even = Odd  (Not relevant for an even sum)
    // 3. Odd  + Odd  = Even (Counted as case 3)
    //
    // Therefore, the total count of pairs yielding an even sum is:
    // (Number of ways to choose 2 even numbers from N even numbers)
    // PLUS
    // (Number of ways to choose 2 odd numbers from M odd numbers)
    //
    // Which translates to:
    // Case 1: N * (N - 1)  (if N >= 2)
    // Case 3: M * (M - 1)  (if M >= 2)
    // The sum of these two expressions gives the total count of desired pairs from a total of N+M balls.


    if  (  N  >=  2   &&   M  >=  2  )
    {
        // Both N and M are sufficient to form pairs.
        // Calculate (N choose 2) + (M choose 2)
        console  .  log (  N  *  (  N  -  1  )   +   M  *  (  M  -  1  )  )  ;
    }
    else   if  (  N  <=  1  )
    {
        // If N is 0 or 1, no pairs of even numbers can be formed.
        // Only consider pairs of odd numbers from M.
        console  .  log (  M  *  (  M  -  1  )  )  ;
    }
    else   if  (  M  <=  0  )
    {
        // If M is 0, no pairs of odd numbers can be formed.
        // Only consider pairs of even numbers from N.
        // Note: The original code has N*(M-1) here.
        // If M=0, this evaluates to N*(-1). This might be an edge case
        // or a specific requirement of the problem that needs to be preserved.
        console  .  log (  N  *  (  M  -  1  )  )  ;
    }


}

// * This section below should not be modified, as per the original instructions.
// * It handles reading input from standard input and invoking the Main function.
Main (  require (  "fs"  )  .  readFileSync (  "/dev/stdin"  ,   "utf8"  )  )  ;