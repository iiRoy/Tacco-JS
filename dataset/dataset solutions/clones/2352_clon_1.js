function    Main (    input    )    {
    /* Input processing begins here */
    const lines  =  input.split(  "\n"  )  ;


    const n    =    +lines[0]    ;

    const rest = lines.slice(1) ; // Remaining lines after n

    /* Data structures for rules */
    const rules  =  [ ]  ;

    // Declare loop variables and temporary storage
    var ai,    rule    ;
    var i,    j,    honestFlags    ;

    /*
     * Iterate through the 'rest' array to parse the rules.
     * Each rule describes the statements made by an individual.
     */
    for  (  i  =  0  ;  i  <  rest.length  ;  i++  )
    {
        ai  =  +rest[i]  ; // Number of statements by the current person

        rule  =  [ ]  ; // Initialize an array to hold statements for current person

        for  (  j  =  1  ;  j  <=  ai  ;  j++  )
        {
            // Each statement is "x y" where x is person and y is their honesty (0 or 1)
            rule.push(  rest[i  +  j].split(  ' '  ).map(  Number  )  )  ;
        }

        rules.push(  rule  )  ; // Add the parsed rule set to the main rules array

        i  +=  ai  ; // Advance the index past the statements for the current person
    }


    var answer  =  0,    honestsCount  ; /* Initialize max honest count found so far */

    // This section performs a bitwise brute-force search over all possible honesty combinations.
    // The 'honestFlags' variable represents a bitmask where the k-th bit (0-indexed)
    // being 1 means person k is honest, and 0 means person k is a liar.
    for  (  honestFlags  =  Math.pow(2, n)  -  1  ;  honestFlags  >  0  ;  honestFlags--  )
    {
        honestsCount  =  countHonests(  honestFlags  )  ; // Calculate number of honest people in current combination

        // Optimization: if the current combination has fewer honest people than
        // what we've already found as a valid maximum, there's no need to
        // validate this combination. Skip it.
        if  (  honestsCount  <=  answer  )
        {
            continue  ;
        }

        /*
         * Check for contradictions within the current honesty assumption.
         * The 'every' method ensures all rules hold true under this assumption.
         */
        if  (  rules.every(  (  rule,  i  )  =>  {
            // Determine if the current person (i) making the statement is assumed to be honest.
            const isHonest  =  (  honestFlags  >>  i  )  %  2  ;

            // For the i-th person, check all their individual statements for consistency.
            return  rule.every(  (  r  )  =>  {
                const xij  =  r[0]  ; // Person xij is the subject of the statement
                const yij  =  r[1]  ; // yij is what person i claims about person xij (0=liar, 1=honest)

                // Determine the assumed honesty of person xij from the current honestFlags bitmask.
                const xijFlag  =  (  honestFlags  >>  (xij  -  1)  )  %  2  ;

                // A statement is consistent if:
                // If the speaker (person i) is honest, their statement (yij) must match
                // the assumed honesty of person xij (xijFlag).
                // If the speaker (person i) is a liar, their statement (yij) must NOT match
                // the assumed honesty of person xij (xijFlag).
                return  isHonest
                    ?  (  yij  ===  xijFlag  ) // If speaker is honest, statement must be true
                    :  (  yij  !==  xijFlag  )  ; // If speaker is a liar, statement must be false
            }  )  ;
        }  )  )
        {
            answer  =  honestsCount  ; // Update the maximum number of honest people found
        }
    }

    // Display the final computed answer.
    console.log(  answer  )  ;

} // End of the Main function


/*
 * This helper function counts the number of set bits (1s) in a given integer.
 * In the context of this problem, it counts how many people are assumed to be honest
 * based on the 'honestFlags' bitmask.
 * @param {number} honestFlags - An integer representing a bitmask of honest individuals.
 * @returns {number} The total count of honest individuals in the given bitmask.
 */
function    countHonests    (    honestFlags    )
{
    var tmpHonestFlags    =    honestFlags    ; // Use a temporary variable to avoid modifying the original flag
    var count    =    0    ; // Initialize counter for honest individuals

    while    (    tmpHonestFlags    >    0    )
    {
        // If the least significant bit is 1, it means this person is honest.
        if    (    tmpHonestFlags    %    2    )
        {
            count++    ; // Increment the honest count
        }
        tmpHonestFlags    =    tmpHonestFlags    >>    1    ; // Right shift to check the next bit
    }

    return    count    ; // Return the final count
}


// Main program execution entry point.
// Reads input from standard input, processes it, and calls the Main function.
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin",  "utf8"  ).trim()  )  ;