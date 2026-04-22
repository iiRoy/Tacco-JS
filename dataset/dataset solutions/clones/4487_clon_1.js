function   Main ( input )
{
    /*
     * This program processes input to calculate a specific combinatorial value.
     * It relies on counting even and odd numbers and then applying combination formulas.
     */

    // First, split the entire input string into an array of individual lines.
    input  =  input . split ( "\n" ) ;


    // The first line of input contains two numbers, separated by a space.
    var  line  =  input [ 0 ] . split ( " " ) ;

    // Parse the first number from the line; this is our primary 'num'.
    var  num  =  parseInt ( line [ 0 ] ) ;
    // Parse the second number from the line; this is often referred to as 'amari' (remainder/modulo context).
    var  amari  =  parseInt ( line [ 1 ] ) ;


    // The second line of input contains a list of numbers, also space-separated.
    var  data  =  input [ 1 ] . split ( " " ) ;

    // Initialize counters for even and odd numbers found in the 'data' array.
    var  even  =  0 ;
    var  odd   =  0 ;


    // Iterate through each element in the 'data' array to determine its parity.
    for  ( var  i  =  0 ;  i  <  data . length ;  i ++ )
    {
        // Convert the string representation of the number to an actual integer.
        data [ i ]  =  parseInt ( data [ i ] ) ;

        // Check if the current number is even or odd using the modulo operator.
        if  ( data [ i ] % 2  ===  0 )
        {
            even ++ ;  // If remainder is 0, it's even. Increment the 'even' counter.
        }
        else
        {
            odd ++ ;   // Otherwise, it's odd. Increment the 'odd' counter.
        }
    }


    // --- Definition of a helper function to calculate the factorial of a number ---
    // Factorial of n (n!) is the product of all positive integers less than or equal to n.
    function  fact ( num )
    {
        var  ans  =  1 ; // Initialize the accumulator for the factorial result.
        for  ( var  i  =  1 ;  i  <=  num ;  i ++ )
        {
            ans  *=  i ; // Multiply 'ans' by the current number 'i'.
        }
        return  ans ;    // Return the calculated factorial.
    }


    // --- Definition of a helper function to calculate combinations (nCr) ---
    // nCr = n! / (r! * (n-r)!)
    function  combi ( total ,  a )
    {
        // Calculate the combination using the factorial function and ensure it's rounded to the nearest integer.
        return  Math . round ( fact ( total )  /  ( fact ( a )  *  fact ( total  -  a ) ) ) ;
    }


    // Calculate the number of ways to choose an even number of items from the 'even' count.
    // This is equivalent to 2 raised to the power of 'even'.
    var  evenCombi  =  Math . pow ( 2 ,  even ) ;


    // Initialize a variable to store the count of odd combinations.
    var  oddCombi  =  0 ;

    // The calculation for odd combinations depends on the value of 'amari'.
    if  ( amari  ===  0 )
    {
        // If 'amari' is 0, we sum combinations of 'odd' items taken in even counts (0, 2, 4, ...).
        for  ( var  i  =  0 ;  i  <=  odd ;  i += 2 )
        {
            oddCombi  +=  combi ( odd ,  i ) ;
        }
    }
    else
    {
        // If 'amari' is not 0, we sum combinations of 'odd' items taken in odd counts (1, 3, 5, ...).
        for  ( var  i  =  1 ;  i  <=  odd ;  i += 2 )
        {
            oddCombi  +=  combi ( odd ,  i ) ;
        }
    }


    // Output the final result, which is the product of 'evenCombi' and 'oddCombi'.
    console . log ( evenCombi  *  oddCombi ) ;

}


// This line reads input from standard input (typically from a file or pipe in competitive programming contexts)
// and then calls the 'Main' function with the read content.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;