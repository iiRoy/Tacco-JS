/*
 * This JavaScript module processes numerical input from standard input.
 * It calculates a specific mathematical value based on a series of cubic sums.
 *
 * This code adheres to a strict Type I clone specification,
 * meaning only whitespace and comments are altered from the original.
 */

// Core module import: 'fs' for file system operations.
var input =    require(  'fs'  ) . readFileSync(  '/dev/stdin'  ,  'utf8'  ) ;


// Data preparation: Read input, trim whitespace, and split into lines.
var arr  =  input . trim( ) . split(  "\n"  ) ;


// Main processing loop: Continuously processes input lines until a sentinel value is encountered.
while  (  true  )
{
    // Extract the next number from the array. The '-0' coerces the string to a number.
    var  z  =  arr . shift( )  -  0 ;

    // Termination condition: If 'z' is zero, break out of the loop.
    if(z==0)break;


    // Calculate the cube of 'z' for later use in cubic difference calculations.
    var  zzz  =  z  *  z  *  z ;

    // Initialize an empty array to store results (positive differences).
    var  ary  =  [ ] ;

    // Outer loop: Iterates for 'i' from (z-1) down to 1.
    for  (  var  i  =  z  -  1  ;  i  >  0  ;  i--  )
    {
        // Inner loop: Iterates for 'j' from 'i' down to 1.
        for  (  var  j  =  i  ;  j  >  0  ;  j--  )
        {
            // Calculate 'x' as the difference between z^3 and the sum of i^3 and j^3.
            var  x  =  zzz  -  i  *  i  *  i  -  j  *  j  *  j ;

            // If 'x' is positive, add it to the 'ary' array.
            if(x>0)ary.push(x);
        }
    }

    // Output the minimum value found in the 'ary' array to the console.
    // Math.min.apply(null, array) is used to find the minimum of an array's elements.
    console . log(  Math . min . apply(  null  ,  ary  )  ) ;
}

// End of script execution.