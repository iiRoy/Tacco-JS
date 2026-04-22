/* This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: only whitespace and comments are altered.
 * All identifiers, operators, and expressions remain precisely the same.
 */

function    Main   (   input   ) {

    // --- Helper function definition starts here ---
    function    compareFunc   (   a   ,   b   )   {
        return   a   -   b   ;   // Standard numerical comparison for sorting.
    }
    // --- Helper function definition ends here ---


    // Input processing:
    // 1. Trim leading/trailing whitespace.
    // 2. Split into lines.
    // 3. Map each line to an array of strings by splitting on spaces.
    input   =   input   .   trim   (   )   .   split   (   "\n"   )   .   map   (   function   (   x   )   {
        return   x   .   split   (   " "   )
    }   )   ;


    // Extracting initial parameters from the first line of input (input[0]).
    var   L1   =   input   [   0   ]   .   map   (   e   =>   parseInt   (   e   ,   10   )   )   ;

    // Assigning parameters to individual, descriptive variables.
    // Note: A and B are scaled by 100 as per problem requirements.
    var   A   =   L1   [   0   ]   *   100   ;   // Parameter A, representing a water component.
    var   B   =   L1   [   1   ]   *   100   ;   // Parameter B, another water component.
    var   C   =   L1   [   2   ]   ;             // Parameter C, a solute component.
    var   D   =   L1   [   3   ]   ;             // Parameter D, another solute component.
    var   E   =   L1   [   4   ]   ;             // Parameter E, maximum solubility percentage.
    var   F   =   L1   [   5   ]   ;             // Parameter F, maximum total weight allowed.


    // --- Generating possible combinations for water (A and B) ---
    var   ABList   =   [   ]   ;   // This list will hold all valid water amounts.
    var   tmp   ;                 // Temporary variable used within the loops.

    /*
     * The outer loop iterates for 'i' multiples of A.
     * The condition (F / A) ensures that the total weight does not exceed F.
     */
    for   (   var   i   =   0   ;   i   <   (   F   /   A   )   ;   i   ++   )   {
        tmp   =   A   *   i   ;   // Calculate current sum from 'A' components.

        /*
         * The inner loop iterates for 'j' multiples of B.
         * (F - tmp) is the remaining weight capacity after 'A' components are added.
         * Dividing by B gives the maximum 'j' for B components.
         */
        for   (   var   j   =   0   ;   j   <   (   (   F   -   tmp   )   /   B   )   ;   j   ++   )   {
            ABList   .   push   (   tmp   +   B   *   j   )   ;   // Add the combined water amount to the list.
        }
    }

    // Sort the list of water amounts in ascending numerical order.
    ABList   .   sort   (   compareFunc   )   ;

    // Remove duplicate values from ABList to optimize subsequent processing.
    ABList   =   ABList   .   filter   (   function   (   x   ,   i   ,   self   )   {
        return   self   .   indexOf   (   x   )   ===   i   ;   // Only keep unique elements.
    }   )   ;
    // --- End of AB combinations generation ---


    // Calculate the maximum possible solute amount 'x' based on total capacity 'F' and solubility 'E'.
    var   x   =   Math   .   floor   (   F   *   E   /   (   100   +   E   )   )   ;

    // --- Generating possible combinations for solute (C and D) ---
    var   CDList   =   [   ]   ;   // This list will store all valid solute amounts.

    /*
     * Similar to ABList generation, but constrained by 'x' (max solute amount).
     * Outer loop for 'i' multiples of C.
     */
    for   (   var   i   =   0   ;   i   <   (   x   /   C   )   ;   i   ++   )   {
        tmp   =   C   *   i   ;   // Current sum from 'C' components.

        /*
         * Inner loop for 'j' multiples of D.
         * (x - tmp) is the remaining solute capacity.
         */
        for   (   var   j   =   0   ;   j   <   (   (   x   -   tmp   )   /   D   )   ;   j   ++   )   {
            CDList   .   push   (   tmp   +   D   *   j   )   ;   // Add the combined solute amount to the list.
        }
    }

    // Sort the list of solute amounts.
    CDList   .   sort   (   compareFunc   )   ;

    // Filter out duplicate values from CDList.
    CDList   =   CDList   .   filter   (   function   (   x   ,   i   ,   self   )   {
        return   self   .   indexOf   (   x   )   ===   i   ;   // Ensure uniqueness for solute amounts.
    }   )   ;
    // --- End of CD combinations generation ---


    // Create a bitmap (or hash map) for efficient lookup of valid solute amounts.
    // This allows O(1) checks for whether a specific solute amount 'j' is possible.
    var   CDbitmap   =   [   ]   ;
    for   (   var   i   =   0   ;   i   <=   x   ;   i   ++   )   {
        CDbitmap   .   push   (   0   )   ;   // Initialize all entries to 0 (not a valid solute amount).
    }

    // Mark all valid solute amounts from CDList in the bitmap.
    for   (   var   i   of   CDList   )   {
        CDbitmap   [   i   ]   =   1   ;   // Set to 1 if 'i' is a possible solute amount.
    }


    // --- Main optimization loop to find the highest density ---
    var   tmpDens   ,   tmpCDLL   ,   tmpCDHL   ; // Variables for density and solute bounds.
    tmpDens   =   0   ;                         // Initialize the maximum density found so far to zero.
    ans   =   [   0   ,   0   ]   ;             // Stores the best [total_weight, solute_weight] found.

    tmpCDHL   =   x   ;                         // Initial upper bound for solute amount (max possible 'x').

    // Iterate through each possible water amount 'i' from the ABList.
    for   (   var   i   of   ABList   )   {
        // Calculate the lower bound for the solute amount 'j' for the current water amount 'i'.
        // This is based on the best density found so far (tmpDens).
        tmpCDLL   =   Math   .   round   (   i   *   tmpDens   )   ;

        // Calculate the upper bound for the solute amount 'j'.
        // It's the minimum of:
        // 1. Maximum solute allowed by solubility E for current water 'i'.
        // 2. Maximum solute allowed by total weight F (F - i).
        tmpCDHL   =   Math   .   min   (   Math   .   floor   (   i   *   E   /   100   )   ,   F   -   i   )   ;

        // Iterate through possible solute amounts 'j' within its calculated bounds.
        for   (   var   j   =   tmpCDLL   ;   j   <=   tmpCDHL   ;   j   ++   )   {
            // Check if 'j' is a valid solute amount using the CDbitmap.
            if   (   CDbitmap   [   j   ]   ===   1   )   {
                // If the current density (j / i) is greater than or equal to the best density found.
                if   (   (   j   /   i   )   >=   tmpDens   )   {
                    ans   [   0   ]   =   i   +   j   ;   // Update total weight.
                    ans   [   1   ]   =   j   ;         // Update solute weight.
                    tmpDens   =   j   /   i   ;         // Update the maximum density.
                }
                CDbitmap   [   j   ]   =   0   ;   // Optimization: Mark 'j' as processed to avoid redundant checks.
            }
        }
    }

    // Output the final answer: total weight and solute weight, rounded to nearest integers.
    console   .   log   (   "%d %d"   ,   Math   .   round   (   ans   [   0   ]   )   ,   Math   .   round   (   ans   [   1   ]   )   )   ;
}

// This line reads input from standard input and passes it to the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;