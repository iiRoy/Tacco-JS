function     Main    (   input   )   {
        //  This function serves as the primary entry point for processing input.
        //  It takes a string 'input' which typically represents data read from standard input.


    // The initial input string is first split into an array of lines based on newline characters.
    input   =   input   .   split   (   "\n"    )   ;

    // The first line of the input array is then split by spaces to extract numerical parameters.
    inputStr    =   input   [   0   ]   .   split   (   " "   )   ;

    // The first element of 'inputStr' is parsed as an integer and assigned to variable N.
    var     N   =   Number  .   parseInt    (   inputStr    [   0   ]   )   ;

    // The second element of 'inputStr' is parsed as an integer and assigned to variable K.
    var     K   =   Number  .   parseInt    (   inputStr    [   1   ]   )   ;


    /*
     *   Now, we process the second line of the input.
     *   This line is expected to contain a series of space-separated numbers representing heights.
     */
    inputStr    =   input   [   1   ]   .   split   (   " "   )   ;

    //  Each string element in 'inputStr' is converted to an integer and stored in the H_arr array.
    var     H_arr   =   inputStr    .   map (   inputStr    =>  parseInt    (   inputStr    )   )   ;


        //  The core algorithm for solving the problem is a dynamic programming approach,
        //  often referred to as a greedy-like strategy in similar contexts.

    // 'i' is initialized to 0, representing the current position (or step).
    var     i   =   0   ;

    // 'ans' is an array that will store the minimum cost to reach each step.
    var     ans =   [   ]   ;

        // The cost to reach step 0 (the starting point) is always 0.
        // This is our base case for the dynamic programming solution.
    ans .   push    (   0   )   ;


    // The cost to reach step 1 is the absolute difference in height between step 1 and step 0.
    ans .   push    (   Math    .   abs (   H_arr   [   1   ]   -   H_arr   [   0   ]   )   )   ;

    /*
     *   We now iterate from step 2 up to N-1 (the final step).
     *   For each step 'i', we calculate the minimum cost to reach it.
     */
    for (   var     i   =   2   ;   i   <   N   ;   i   ++  )   {
        // 'last' stores the minimum cost found so far for the current step 'i'.
        // It's initialized to a very large number to ensure any valid cost will be smaller.
        var     last    =   99999   ;

        // This inner loop considers all possible previous steps from which we can jump to 'i'.
        // We can jump from 'j' steps back, where 'j' ranges from 1 to K.
        for (   var     j   =   1   ;   j   <=  K   ;   j   ++  )   {
            // If 'i - j' is less than 0, it means we are trying to jump from a non-existent negative step.
            // In this case, we break out of the inner loop as further 'j' values will also be invalid.
            if  (   i   -   j   <   0   )   {
                break   ;
            }

            // Calculate the temporary cost to reach step 'i' by jumping from step 'i-j'.
            // This cost is the sum of the minimum cost to reach 'i-j' and the absolute height difference
            // between step 'i' and step 'i-j'.
            var     tmp =   ans [   i   -   j   ]   +   Math    .   abs (   H_arr   [   i   ]   -   H_arr   [   i   -   j   ]   )   ;

            // Update 'last' with the minimum of its current value and the newly calculated 'tmp' cost.
            last    =   Math    .   min (   tmp ,   last    )   ;

            // console.log("Heights being compared:", H_arr[i], H_arr[i-j]); // Debugging comment
        }

        // After checking all possible jumps to step 'i', store the minimum cost found ('last')
        // into the 'ans' array for step 'i'.
        ans .   push    (   last    )   ;

        // console.log("Current costs array:", ans); // Debugging comment
    }

    // Finally, print the minimum cost to reach the last step (N-1).
    console .   log (   ans [   N   -   1   ]   )   ;
}


// This line reads the input from '/dev/stdin' (standard input)
// and passes it as a string to the 'Main' function for processing.
Main    (   require (   "fs"    )   .   readFileSync (   "/dev/stdin"    ,   "utf8"  )   )   ;