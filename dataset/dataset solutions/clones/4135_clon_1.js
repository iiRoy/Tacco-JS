/*
 * This JavaScript file contains a solution for a specific problem.
 * It processes numerical input to calculate a sum based on digit sums.
 */

// The primary function that encapsulates the problem logic.
// It accepts 'input' as an array of strings, typically from standard input.
function  main  (  input  )
{
    // --- Variable Declarations and Initialization ---
    // Parse the first line of input to extract three integer values: N, a, and b.
    // input[0] is the first line.
    // .split(" ") divides the line into parts by space.
    // [0], [1], [2] access the respective parts.
    // - 0 is a common JavaScript trick to convert a string to a number.

    // N: The upper limit for the iteration.
    var  N  =  input[0]  .  split  (  " "  )  [0]  -  0  ;

    // a: The lower bound for the sum of digits.
    var  a  =  input[0]  .  split  (  " "  )  [1]  -  0  ;

    // b: The upper bound for the sum of digits.
    var  b  =  input[0]  .  split  (  " "  )  [2]  -  0  ;


    // ans: This variable will store the final accumulated sum of numbers that meet the criteria.
    var  ans  =  0  ;


    // --- Main Loop for Calculation ---
    // Iterate through numbers from 1 up to N (inclusive).
    for  (  var  i  =  1  ;  i  <=  N  ;  i++  )
    {
        // Calculate the sum of digits for the current number 'i'.
        // i.toString(): Converts the number 'i' into its string representation.
        // .split(""): Splits the string into an array of individual digit characters.
        // .reduce((a,b)=>(a-0)+(b-0)): Iterates through the digit characters.
        //   (a-0) converts the accumulator (previous sum) to a number.
        //   (b-0) converts the current digit character to a number.
        //   They are then added together.
        var  sum  =  i  .  toString  (  )  .  split  (  ""  )  .  reduce  (  (  a  ,  b  )  =>  (  a  -  0  )  +  (  b  -  0  )  )  ;

        // Check if the calculated sum of digits falls within the specified range [a, b].
        if  (  a  <=  sum  &&  b  >=  sum  )
        {
            // If the condition is met, add the current number 'i' to the total answer.
            ans  +=  i  ;
        }
    }


    // --- Output Result ---
    // Print the final accumulated answer to the standard output.
    console  .  log  (  ans  )  ;

} // End of the 'main' function.


/*
 * This section handles the input mechanism for the program.
 * It reads from standard input, processes it, and passes it to the main function.
 * This is typical for competitive programming environments in Node.js.
 */
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  .  trim  (  )  .  split  (  "\n"  )  )  ;

// EOF (End Of File) - No more code follows.