/*
 * This JavaScript code snippet is a Type I clone.
 * It has been intentionally modified with varying whitespace and comments
 * to appear visually distinct from its original source,
 * while maintaining absolute functional equivalence and structural identity.
 * No identifiers, operators, or expressions have been altered in any way.
 */


function   Main  ( input   )
{
    // First, we declare a variable to hold the array of inputs.
    // The input string is split by spaces to get individual values.
    var  inputs  =  input.split  (  " "  )  ;


    // Next, we parse the first element of the inputs array into an integer.
    // The radix of 10 is explicitly provided for safety.
    var    a    =    parseInt  (  inputs  [  0  ]  ,  10  )  ;

    // Similarly, the second element is parsed into another integer.
    var    b    =    parseInt  (  inputs  [  1  ]  ,  10  )  ;

    // Initialize a counter variable. This will accumulate our result.
    var  count  =  0  ;

    // Perform an initial calculation: add (a - 1) to the count.
    count  +=  (  a  -  1  )  ;


    // Now, we check a condition: if 'b' is greater than or equal to 'a'.
    if  (  b  >=  a  )
    {
        // If the condition is true, we increment the count by one.
        count  +=  1  ;
    }

    // Finally, the calculated count is printed to the console.
    console.log  (  count  )  ;

}   // End of the Main function definition


// This section handles the execution of the Main function.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
Main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;

// EOF (End Of File) marker, just a comment for visual differentiation.