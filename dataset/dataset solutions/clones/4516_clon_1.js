/*
 * This JavaScript module processes input data
 * to calculate a specific value based on two numbers.
 * The 'input' parameter will contain the entire input string.
 */
function   Main   (   input   )
{
    // Declare variables to hold the parsed numbers.
    var   n_dog  ,  n_monkey   ;

    // First, split the input string by newline characters.
    input  =  input . split ( "\n" ) ;

    // Then, take the first line and split it by spaces.
    input  =  input [ 0 ] . split ( " " ) ;

    // Assign the first part to n_dog.
    n_dog  =  input [ 0 ] ;

    // Assign the second part to n_monkey.
    n_monkey  =  input [ 1 ] ;


    /*
     * Check the absolute difference between n_dog and n_monkey
     * to determine the appropriate calculation path.
     */
    if  (  Math . abs ( n_dog  -  n_monkey )  >=  2  )
    {
        // If the difference is 2 or more, output 0.
        console . log ( 0 ) ;
    }
    else  if  (  Math . abs ( n_dog  -  n_monkey )  ==  1  )
    {
        // If the difference is exactly 1, calculate the product of factorials (modulo 1000000007).
        console . log ( (  ( factorial ( n_dog )  %  1000000007 )  *  ( factorial ( n_monkey )  %  1000000007 )  )  %  1000000007 ) ;
    }
    else  if  (  Math . abs ( n_dog  -  n_monkey )  ==  0  )
    {
        // If the difference is 0 (numbers are equal), calculate 2 * product of factorials (modulo 1000000007).
        console . log ( (  (  ( factorial ( n_dog )  %  1000000007 )  *  ( factorial ( n_monkey )  %  1000000007 )  )  *  2  )  %  1000000007 ) ;
    }

} // End of Main function definition.


// Define a factorial function using a function expression.
var   factorial   =   function   (   num   )
{
    // Base case for factorial: if num is 0 or less, return 1.
    // Otherwise, recursively calculate num * factorial(num-1), applying modulo at each step.
    return   ( num   <=   0 )   ?   1   :   (   ( num   %   1000000007 )   *   ( factorial ( num  -  1 )   %   1000000007 )   )   ;
}   ;   // End of factorial function.


/*
 * DO NOT EDIT THE LINE BELOW THIS POINT.
 * It handles standard input/output operations
 * and invokes the Main function with the input data.
 */
Main  (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;