/*
 * This is a Type I clone of the original JavaScript code.
 * All functional aspects are identical; only whitespace and comments
 * have been altered to demonstrate visual difference.
 */
function  Main  (  input  )
{
    // The primary function that processes the input data.

    input   =   input.split  (  "\n"  )   ;   // Split the input string by newline characters into an array of lines.


    // Declare a constant 'n' and parse the first line of input as an integer.
    const  n  =  parseInt  (  input  [  0  ]  )  ;

    // Initialize a counter variable to keep track of valid combinations.
    var  count  =  0  ;


    // Start of the first nested loop: iterating through possible 'a' values from 1 to 999.
    for  (  var  a  =  1  ;  a  <  1000  ;  a  ++  )
    {
        // Start of the second nested loop: iterating through possible 'b' values from 1 to 999.
        for  (  var  b  =  1  ;  b  <  1000  ;  b  ++  )
        {
            // Start of the third nested loop: iterating through possible 'c' values from 1 to 999.
            for  (  var  c  =  1  ;  c  <  1000  ;  c  ++  )
            {
                // Check if the current combination (a * b + c) equals the target number 'n'.
                if  (  n  ==  (  a  *  b  +  c  )  )
                {
                    // If the condition is met, increment the counter.
                    count  ++  ;
                }
            } // End of the innermost 'c' loop.
        } // End of the middle 'b' loop.
    } // End of the outermost 'a' loop.


    // Output the final count of combinations that satisfy the condition to the console.
    console.log  (  '%d'  ,  count  )  ;

} // End of the Main function definition.

/*
 * This section of the code handles standard input/output operations.
 * As per the original instructions, this part should remain functionally
 * unchanged to ensure proper execution in the given environment.
 */
// * この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;