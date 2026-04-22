/*
 * This JavaScript file contains a main function to process input
 * and two helper functions for array summation.
 * The program determines a winner ("first" or "second") based on
 * specific calculations performed on the input data.
 */
function Main ( input )
{
    // The input is initially a string. It's split by newline characters
    // and each resulting substring is converted into a numerical value.
    input  =  input.split( "\n" ).map( Number ) ;

    // The first element of the input array is often metadata or a count,
    // so it is removed from the array to prepare for further processing.
    input.shift() ;

    // A variable 'n' is declared and initialized with the sum of all
    // numerical elements currently in the 'input' array.
    var n  =  arrsum( input ) ;

    // This conditional block checks if the calculated sum 'n' is
    // equivalent to the number of elements remaining in the 'input' array.
    // If they match, 'n' is reset to a value of 1.
    if  (  n  ==  input.length  )
    {
        n  =  1  ; // Assigns the integer value 1 to 'n'.
    }

    // Another conditional check is performed. It calculates a sum of elements
    // in the 'input' array, specifically excluding any elements that are equal to 1.
    // If this conditional sum is found to be an odd number (i.e., its remainder
    // when divided by 2 is 1), then 'n' is once again reset to 1.
    if  (  arrsum2( input )  %  2  ==  1  )
    {
        n  =  1  ;
    }

    // The final decision logic is based on the parity of 'n'.
    // If 'n' is an odd number, "first" is logged to the console.
    if  (  n  %  2  ==  1  )
    {
        console.log( "first" ) ;
    }
    // If 'n' is an even number, "second" is logged to the console.
    else
    {
        console.log( "second" ) ;
    }
}

// Immediately invoke the Main function.
// It reads content from standard input ("/dev/stdin"), decodes it as UTF-8,
// removes any leading/trailing whitespace, and passes it as the 'input' argument.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() ) ;


/*
 * Function Name: arrsum
 * Description: Calculates the total sum of all numerical elements within an array.
 * Parameters:
 *   - arr: An array of numbers.
 * Returns:
 *   The sum of all numbers in the provided array.
 */
function arrsum ( arr )
{
    var sum  =  0  ; // Initialize the sum accumulator to zero.

    // Loop through the array from the first element up to (but not including) the last.
    for  (  var  i  =  0  ,  len  =  arr.length  ;  i  <  len  ;  ++i  )
    {
        sum  +=  arr[i]  ; // Add the current element's value to the running total.
    }
    return  sum  ; // Return the final calculated sum.
}


/**
 * Function Name: arrsum2
 * Description: Calculates a conditional sum of numerical elements within an array.
 *              Only elements that are not equal to 1 are included in the sum.
 * Parameters:
 *   - arr: An array of numbers.
 * Returns:
 *   The sum of all numbers in the array, excluding any '1's.
 */
function arrsum2 ( arr )
{
    var sum  =  0  ; // Initialize the sum for this conditional calculation.

    // Iterate over each element in the input array.
    for  (  var  i  =  0  ,  len  =  arr.length  ;  i  <  len  ;  ++i  )
    {
        // Check if the current array element is not equal to 1.
        if  (  arr[i]  !=  1  )
        {
            sum  +=  arr[i]  ; // If it's not 1, add its value to the sum.
        }
    }
    return  sum  ; // Return the conditional sum.
}