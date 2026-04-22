/*
 * This JavaScript file contains a function to determine if a number is prime,
 * and then processes standard input to count prime numbers from a list.
 *
 * It adheres to the Type I clone definition, meaning all identifiers,
 * variable names, function names, operators, and expressions are exact copies.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * extensively to create a visually distinct version of the original code.
 */


function isPrime  (  num  )
{
    // First, handle the special cases for 2 and 3, which are prime.
    if  (  num  ==  2   ||   num  ==  3  )
    {
        return   true  ;
    }

    /*
     *  Next, check for numbers less than 2, or any even number
     *  (excluding 2, already handled), or any multiple of 3
     *  (excluding 3, already handled). These are not prime.
     */
    if  (  num  <  2   ||   num  %  2  ==  0   ||   num  %  3  ==  0  )
    {
        return   false  ;
    }

    // Calculate the maximum divisor to check. We only need to go up to
    // the square root of the number for prime checking efficiency.
    var   max   =   Math  .  floor  (  Math  .  sqrt  (  num  )  )  ;


    // Employ a 6k +/- 1 optimization loop.
    // All prime numbers greater than 3 can be expressed in the form 6k - 1 or 6k + 1.
    for  (  var   n   =   1  ;    n  *  6  -  1    <=    max  ;    n  ++  )
    {
        // Check divisibility by (6k - 1) and (6k + 1).
        // If num is divisible by either, it's not prime.
        if  (  num  %  (  n  *  6  -  1  )  ==  0   ||   num  %  (  n  *  6  +  1  )  ==  0  )
        {
            return   false  ;
        }
    }

    // If the number passed all checks, it is a prime number.
    return   true  ;
}


// Start processing standard input.
process  .  stdin  .  resume  (  )  ;

// Ensure the input is treated as UTF-8 encoded text.
process  .  stdin  .  setEncoding  (  'utf8'  )  ;

/*
 * Set up an event listener for incoming 'data' chunks from standard input.
 * This function will be executed whenever input data is available.
 */
process  .  stdin  .  on  (  'data'  ,
    function   (   chunk   )
    {
        // Split the received chunk of data into individual lines.
        var   lines   =   chunk  .  split  (  '\n'  )  ;

        // Remove the first line of input, as it's often a header or count
        // that's not needed for the prime checking logic.
        lines  .  shift  (  )  ;

        // Filter the remaining lines, converting each line to a number
        // and then using the isPrime function to keep only the prime numbers.
        // Finally, log the total count of prime numbers found.
        console  .  log  (  lines  .  filter  (  isPrime  )  .  length  )  ;
    }
)  ;