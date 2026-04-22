/**
 * This script processes input data to calculate a specific value.
 * The primary function, `Main`, orchestrates the entire computation.
 */

function   Main  (  input  )
{
    // Split the entire input string by newline characters into an array of lines.
    var   line   =   input.split ( "\n" ) ;

    // The first line contains two space-separated numbers.
    var   tmp   =   line [ 0 ] . split (  " "  ) ;

    // Parse the first number as the maximum integer value.
    var   maxint   =   Number (  tmp [ 0 ]  ) ;

    // Parse the second number as the minimum remainder value.
    var   minrest   =   Number (  tmp [ 1 ]  ) ;

    // Initialize the answer variable to zero. This will accumulate the count.
    var   ans   =   0 ; // Our final result accumulator

    // Outer loop: iterate 'a' from 'minrest' (or 1 if 'minrest' is falsy) up to 'maxint'.
    for   (  var   a   =   minrest   ||   1  ;
             a   <=   maxint  ;
             a ++
          )
    {
        // Inner loop: iterate 'b' from 'minrest' (or 1 if 'minrest' is falsy) up to 'maxint'.
        for   (  var   b   =   minrest   ||   1  ;
                 b   <=   maxint  ;
                 b ++
              )
        {
            // Conditional check: if 'a' is strictly less than 'b'.
            if   (  a   <   b  )
            {
                // Increment the answer if 'a' is smaller than 'b'.
                ans ++ ;
            }
            else
            {
                // If 'a' is not less than 'b' (i.e., a >= b), perform another check.
                // Check if the remainder of 'a' divided by 'b' is greater than or equal to 'minrest'.
                if   (  a   %   b   >=   minrest  )
                {
                    // Increment the answer if the remainder condition is met.
                    ans ++ ;
                }
            }
        }
    }

    // Output the final calculated answer to the console.
    console.log (  ans  ) ;
}


/*
 * This section should not be modified. It handles standard input/output
 * and invokes the Main function with the input data.
 */
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;