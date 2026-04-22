/*
 * This script identifies an original value based on
 * its calculated 8% and 10% tax components.
 */
const findOriginalAmount = (  inputLines  ) => {

    // Retrieve the first line of input and separate the expected tax values.
    const taxStrings  =  inputLines[0] . split ( " " ) ;

    // Convert the extracted string representations into numerical values.
    let expectedTaxA  =  Number(  taxStrings[0]  ) ;  // The target value for 8% tax calculation
    let expectedTaxB  =  Number(  taxStrings[1]  ) ;  // The target value for 10% tax calculation

    let solutionValue   =   -1   ;  // Placeholder for the final result; -1 indicates no solution found yet.
    let currentTaxB  =  0  ;  // This variable tracks the floor(potentialValue * 0.1) for the loop condition.
    let potentialValue  =  0  ;  // This is the base amount currently being tested.

    // Flags to indicate if the current potentialValue satisfies each tax condition.
    let foundTaxA   =   false   ;
    let foundTaxB   =   false   ;

    // Iterate through possible base amounts, starting from zero.
    // The loop continues as long as the calculated 10% tax does not exceed its target plus one.
    while (   currentTaxB   <   expectedTaxB  +  1   )   {

        // Check if 8% of the potential value, floored, matches the expected 8% tax.
        if  (   Math.floor (   potentialValue  *  0.08   )   ===   expectedTaxA   )   {
            foundTaxA   =   true   ;
        }

        // Check if 10% of the potential value, floored, matches the expected 10% tax.
        if  (   Math.floor (   potentialValue  *  0.1   )   ===   expectedTaxB   )   {
            foundTaxB   =   true   ;
        }

        // If both tax conditions are simultaneously met for the current potential value.
        if  (   foundTaxA   ===   true   &&   foundTaxB   ===   true   )   {
            solutionValue   =   potentialValue   ;  // Assign this value as the solution.
            break   ;  // Terminate the search as the first valid solution is found.
        }

        // Reset the flags for the next iteration if no match was found.
        foundTaxA   =   false   ;
        foundTaxB   =   false   ;

        // Update the current 10% tax calculation to control the loop.
        currentTaxB   =   Math.floor (   potentialValue  *  0.1   )   ;
        potentialValue++   ;  // Increment the potential base amount for the next check.
    }

    // Output the computed solution (or -1 if none was found).
    console.log (   solutionValue   ) ;
};

// Entry point: Read input from standard input, parse it, and invoke the primary calculation routine.
findOriginalAmount (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'UTF-8' ) . trim ( ) . split ( "\n" )   ) ;