/*
 * This JavaScript program processes a series of input lines
 * to determine a count based on specific conditions.
 * It's structured as a single function that reads from stdin.
 *
 * This is a demonstration of a Type I code clone,
 * where only whitespace and comments are altered.
 */
function     Main   (   input   )
{
    // The 'input' parameter initially holds the entire standard input as a single string.
    // We first split this string into an array of lines using the newline character.
    input   =   input  .  split(  "\n"  )  ;


    // The very first line of the input (at index 0) contains critical
    // memory parameters or thresholds. We parse this line by splitting it
    // based on space characters.
    var   mem   =   input[0]  .  split(  " "  )  ;


    // Initialize a counter variable 'sum' to zero.
    // This variable will accumulate the total count that meets our criteria.
    var   sum   =   0  ;


    // We now iterate through the remaining lines of the input.
    // The loop starts from the second line (index 1) and continues
    // until all lines have been processed.
    for  (  var   i  =  1  ;  i  <  input.length  ;  i++  )
    {
        // For each line within the loop, we split it by spaces.
        // This gives us an array 'n' containing the individual values from the current line.
        var   n   =   input[i]  .  split(  " "  )  ;

        // A conditional check is performed here:
        // If the first element of 'n' (n[0]) is greater than or equal to the
        // second memory parameter (mem[1]), AND
        // if the second element of 'n' (n[1]) is greater than or equal to the
        // third memory parameter (mem[2]), then we increment our counter.
        // Note: JavaScript's comparison operators will perform type coercion if necessary.
        if  (  n[0]  >=  mem[1]  &&  n[1]  >=  mem[2]  )
        {
            sum++;   // Increment the sum counter by one.
        }
    }


    // After the loop has completed, all relevant lines have been processed.
    // The final accumulated sum is then printed to the console.
    console.log(  sum  )  ;

}   //  End of the Main function definition.


// This is the entry point of the program execution.
// It reads the entire content of standard input, converts it to a UTF-8 string,
// removes any leading/trailing whitespace (like a final newline), and then
// passes this processed string to the 'Main' function for execution.
Main(  require(  "fs"  )  .  readFileSync(  "/dev/stdin"  ,  "utf8"  )  .  trim(  )  )  ;