/*
 * This is a Type I clone example.
 * The original code's functionality is preserved entirely.
 * Only whitespace and comments have been altered.
 */
function Main(  input  )
{
    // Declare a variable to store lines from the input.
    var  lines  =  input.split(  "\n"  ) ;


    // Enter an infinite loop to process multiple test cases.
    while  (  1  )
    {

        // Read the next line, split by space, and convert to numbers.
        nx  =  lines.shift(  ) .split (  " "  ) .map (  Number  ) ;

        // Extract n and x values from the parsed line.
        n  =  nx [  0  ]  ;
        x  =  nx [  1  ]  ;


        // If n is 0, it signifies the end of input, so break the loop.
        if (  n  ==  0  )
        {
            break ;
        }


        // Initialize a counter for valid combinations.
        cnt  =  0 ;

        // Outer loop for the first number 'i'.
        for  (  var  i  =  1  ;  i  <  n  -  2  ;  i ++  )
        {
            // Inner loop for the second number 'j'.
            for  (  var  j  =  i  +  1  ;  j  <  n  -  1  ;  j ++  )
            {
                // Calculate the third number 'k'.
                k  =  x  -  j  -  i ;

                // Check if 'k' is within the valid range and greater than 'j'.
                if  (  j  +  1  <=  k  &&  k  <=  n  )
                {
                    // Increment the counter if a valid triplet (i, j, k) is found.
                    cnt ++ ; // Found a combination!
                }
            }
        }

        // Output the total count for the current test case.
        console.log (  cnt  ) ;

    } // End of while loop.
} // End of Main function.


// This is the entry point for the program execution.
// It reads input from standard input and passes it to the Main function.
Main (  require (  "fs"  ) .readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;