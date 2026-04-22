/*
 * This is a JavaScript program designed to solve a specific problem.
 * It takes input, processes it, and then outputs 'Yes' or 'No' based on a condition.
 */

// Define the main function that encapsulates the core logic.
// This function will be called with the raw input string.
function   Main  (  input  )
{
    // Declare a variable 'xs' to store the processed numerical values.
    // The input string is first trimmed, then split by spaces, and finally
    // each part is converted into an integer with base 10.
    var    xs   =   input.trim() .split(' ') .map(v => parseInt(v, 10)) ;


    // Assign individual elements from the 'xs' array to distinct variables.
    // These variables represent the four numbers provided in the input.
    a  =  xs[0] ; // The first number
    b  =  xs[1] ; // The second number
    c  =  xs[2] ; // The third number
    d  =  xs[3] ; // The fourth number


    // Evaluate a complex conditional statement.
    // The condition checks two main parts connected by a logical OR (||).
    // Part 1: (Math.abs(a-b <=d))
    // Part 2: (Math.abs(a-b <=d) && Math.abs(b-c <=d))
    // Note: The expression `a-b <=d` evaluates to a boolean (true/false).
    //       `Math.abs()` then converts this boolean to 1 or 0. This exact
    //       behavior, including this implicit type conversion, is preserved.
    if  (  (  Math.abs  (  a  -  b   <=   d  )  )   ||   (  Math.abs  (  a  -  b   <=   d  )   &&   Math.abs  (  b  -  c   <=   d  )  )  )
    {
        // If the condition evaluates to true, print 'Yes' to the console.
        console.log  (  'Yes'  ) ;
    }
    // If the primary condition is false, execute the 'else' block.
    else
    {
        // Print 'No' to the console.
        console.log  (  'No'  ) ;
    }
} // End of Main function definition.


// This section handles the execution of the Main function.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module,
// decodes it as UTF-8, and then passes it to the Main function.
// This is typical for competitive programming environments in Node.js.
Main  (  require  (  "fs"  ) .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  ) ; // Function call to initiate the program.