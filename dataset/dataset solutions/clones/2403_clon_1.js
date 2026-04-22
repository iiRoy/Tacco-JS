/*
 * This JavaScript function, named 'Main', serves as the primary entry point
 * for processing input data. It is designed to handle a string input,
 * parse it into lines, and then perform specific calculations
 * based on numerical values extracted from these lines.
 *
 * The overall goal is to determine a sequence of steps (represented by 'ansArray')
 * or a single value ('ans') based on given constraints N and M, and a binary string S.
 */
function Main(  input  ) {
    // The input string is first divided into an array of lines.
    // Each line from the original input string will become an element
    // in the 'lines' array, indexed from 0.
    var lines = input  .split ( "\n" )  ;; // Note: Double semicolon intentionally preserved as per original.

    // Extracting numerical parameters N and M from the first line of input.
    // The first element of the first line (index 0) is N.
    var N = Number(  lines[0]  .split(  " "  )[0]  ) ;

    // The second element of the first line (index 1) is M.
    var M = Number(  lines[0]  .split(  " "  )[1]  ) ;

    // The second line of the input is treated as a string S.
    var S = lines [ 1 ] ;

    // 'ans' will store the final result of the computation.
    var ans;

    // --- Core Logic Begins Here ---

    // Special case: If N is less than or equal to M, the answer is simply N.
    if  (  N  <=  M  )
    {
        ans = N ; // Direct assignment for this simple condition.
    }
    else // If N is strictly greater than M, more complex processing is required.
    {
        // Initialize an array to store the sequence of steps.
        var ansArray = new Array ( ) ;

        // 'presentIdx' tracks the current position in the string S,
        // effectively representing the sum of steps taken so far.
        var presentIdx = 0 ;

        // This loop attempts to find a valid sequence of steps backwards.
        // It iterates from M down to 0.
        for  (  var i = M ;  i >= 0 ;  i--  )
        {
            // If 'i' becomes 0 and no steps have been recorded yet,
            // it indicates that a solution cannot be found.
            if  (  i == 0  &&  ansArray.length == 0  )
            {
                ans = -1 ; // Set 'ans' to -1 to signify no solution.
                break ;    // Exit the loop as no solution is possible.
            }

            // Check if the remaining distance (N - presentIdx) can be covered
            // by the current step 'i' or less.
            // If (N - presentIdx - i) is less than or equal to 0, it means
            // 'i' is large enough to reach or overshoot the target.
            if  (  N - presentIdx - i <= 0  )
            {
                // Add the exact remaining distance to the front of the array.
                ansArray.unshift(  N - presentIdx  ) ;
                break ; // Solution found for the remaining part, exit loop.
            }

            // Check if the character at the calculated position in string S is '0'.
            // The position is (N - presentIdx - i).
            // This condition is crucial for determining valid steps.
            if  (  S[N - presentIdx - i]  ==  "0"  )
            {
                // If '0' is found, 'i' is a valid step.
                // Add 'i' to the front of the sequence array.
                ansArray.unshift(  i  ) ;

                // Update the 'presentIdx' by adding the step 'i'.
                presentIdx += i ;

                // Reset 'i' to M + 1. When the loop decrements 'i' in the next iteration,
                // it will restart from M, effectively looking for the next step from M down again.
                i = M + 1 ;
            }
        } // End of for loop for finding steps.

        // After the loop, if 'ans' was not set to -1 (meaning a solution was found),
        // join the steps in 'ansArray' into a single space-separated string.
        if  (  ans  !=  -1  )
        {
            ans = ansArray.join(  " "  ) ;
        }
    } // End of else block.

    // --- Outputting the Result ---

    // The final computed answer is printed to the standard output.
    console.log(  '%s' ,  ans  ) ;
}

/*
 * The following line is crucial for the execution environment.
 * It reads input from standard input and passes it to the 'Main' function.
 * Do not modify this specific line of code or its functionality.
 * It ensures proper interaction with the judge system.
 */
Main(  require(  "fs"  ) . readFileSync(  "/dev/stdin"  ,  "utf8"  )  ) ;