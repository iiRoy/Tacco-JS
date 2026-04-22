/*
 * This program processes input data to determine
 * a specific condition based on numerical values.
 *
 * It's designed to be executed in a Node.js environment
 * where file system access is available for reading stdin.
 */
// The primary function that encapsulates the program's logic.
function   Main  (  input  )
{
    // The input variable initially contains the raw string data.
    // It is then processed by splitting it into an array of lines.
    input  =  input.split (  "\n"  )  ;


    // The first line of the input is expected to contain two space-separated numbers.
    var   line1   =   input [  0  ] .split (  " "  )  ;

    // Extract the first number from the parsed line and convert it to a numeric type.
    var   a   =   Number (  line1 [  0  ]  )  ;
    // Extract the second number from the parsed line and convert it to a numeric type.
    var   b   =   Number (  line1 [  1  ]  )  ;

    // Check a specific mathematical condition involving the numbers 'a' and 'b'.
    // The condition evaluates if (a+b) is NOT divisible by 3, AND a is NOT divisible by 3, AND b is NOT divisible by 3.
    // If all three conditions are true (i.e., all remainders are non-zero), then the expression evaluates to true.
    if  (  (  a  +  b  )  %  3    &&    a  %  3    &&    b  %  3  )
    {
        // If the complex condition is met, print "Impossible" to the console.
        console.log  (  "Impossible"  )  ;
    }
    else
    {
        // Otherwise (if the complex condition is NOT met), print "Possible" to the console.
        console.log  (  "Possible"  )
    }
}


// This section handles the execution of the program.
// It reads the entire content from standard input (stdin),
// converts it to a UTF-8 string, and passes it to the Main function.
Main  (  require (  "fs"  ) .readFileSync (  "/dev/stdin"  ,  "utf8"  )  )  ;