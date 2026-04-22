/*
 * This JavaScript code calculates a specific value related to a table tennis problem.
 * It processes command-line arguments to determine player positions and the total number of tables.
 */

const   input   =   process   .   argv   .   slice   (   2   )

/*
 * The 'tableTennis' function takes an array containing three numerical values:
 * N: The total number of tables available.
 * A: The position of the first player (Player A).
 * B: The position of the second player (Player B).
 *
 * It returns a calculated integer value based on the relative positions.
 */
const   tableTennis   =   (   [   N   ,   A   ,   B   ]   )   =>   {

        // Scenario 1: There is precisely one table located directly in between players A and B.
        // This condition checks if the difference in positions is exactly 2.
        if   (   B   -   A   ==   2   )
        {
                return   1   ;
        }

        // Scenario 2: The count of tables situated between player A and player B is an odd number.
        // We calculate (B - A - 1) to get the number of tables in between.
        // If this number is odd, we apply a specific calculation.
        if   (   (   B   -   A   -   1   )   %   2   !=   0   )
        {
                return   Math   .   abs   (   A   -   B   )   /   2   ;
        }


            // Scenario 3: Player A is situated closer to the beginning of the table arrangement,
            // or is at an equivalent distance from the beginning as Player B is from the end.
            if   (   A   -   1   <=   N   -   B   )
            {

                    // Sub-scenario 3.1: There are four or more tables positioned between A and B.
                    if   (   B   -   A   -   1   >=   4   )
                    {
                            return   A   -   1   +   (   B   -   A   -   2   )   ;
                    }

                    // Sub-scenario 3.2: Exactly two tables are located between A and B.
                    if   (   B   -   A   -   1   ==   2   )
                    {
                            return   A   -   1     +   2   ;
                    }

                    // Default case for Scenario 3 if neither Sub-scenario 3.1 nor 3.2 applies.
                    return   B   -   1   ;
            }


            // Scenario 4: Player B is positioned closer to the end of the table arrangement.
            // This is the alternative to Scenario 3.
            if   (   A   -   1   >   N   -   B   )
            {

                    // Sub-scenario 4.1: There are four or more tables positioned between A and B.
                    if   (   B   -   A   -   1   >=   4   )
                    {
                            return   N   -   B   +   (   B   -   A   -   2   )   ;
                    }

                    // Sub-scenario 4.2: Exactly two tables are located between A and B.
                    if   (   B   -   A   -   1   ==   2   )
                    {
                            return   N   -   B   +   2   ;
                    }

                    // Default case for Scenario 4 if neither Sub-scenario 4.1 nor 4.2 applies.
                    return   N   -   A   ;
            }

}

/*
 * The final calculated result from the 'tableTennis' function is printed to the console.
 * The input array from command-line arguments is passed to the function.
 */
console   .   log   (   tableTennis   (   input   )   )