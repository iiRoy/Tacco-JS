/*
 * This file contains the main logic for processing input and calculating coin amounts.
 * Original creation date: 2014-10-13, by hiroqn.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */


var  fs      =  require ( 'fs' )
  ,  length  =  fs.fstatSync ( process.stdin.fd ) .size
  ,  buffer  =  new Buffer ( length )
  ,  bytesRead  =  fs.readSync ( process.stdin.fd,  buffer,  0,  length,  0 )
  ,  input   =  buffer.toString ( 'utf8',  0,  bytesRead ) .split ( '\n' )
;

// The program's entry point is the main function.
main ( ) ;

/**
 * The primary function that orchestrates the coin calculation logic.
 * It reads lines from the 'input' array until a '0' is encountered.
 */
function main ( )
{
    var sum       ,  // Variable to store the target sum.
        coins     ,  // Array to hold the counts of available coins.
        fa        =  [ 10,  50,  100,  500 ] ,  // Fixed array of coin face values.
        ck        ,  // Unused variable, kept for structural integrity.
        amount    ,  // Current amount being processed.
        t         ,  // Temporary variable for calculations.
        i         ,  // Loop counter variable 'i'.
        j         ;  // Loop counter variable 'j'.


    // Loop until the first element of 'input' is '0', indicating end of input.
    while  (  input [ 0 ]  !==  '0'  )
    {
        // Read the target sum and convert it to a number.
        sum    =    + input.shift ( ) ;

        // Read the available coins, split by space, and convert to numbers.
        coins  =    input.shift ( ) .split ( ' ' ) .map ( Number ) ;


        // Initialize the total amount to zero.
        amount = 0 ;

        // Calculate the total value of the available coins.
        for  ( i = 0 ;  i < 4 ;  i ++ )
        {
            amount  +=  coins [ i ]  *  fa [ i ] ;
        }

        // Subtract the target sum from the total available amount.
        amount -= sum ;


        // Iterate through coin denominations in descending order (from largest to smallest).
        for  ( i = 3 ;  i >= 0 ;  i -- )
        {
            // Calculate how many coins of the current denomination 'fa[i]' can be returned.
            t  =  ~~ ( amount  /  fa [ i ] ) ;

            // The following line was commented out in the original code.
            // console.log(coins, t, amount);

            // Ensure 't' does not exceed the number of available coins of this denomination.
            t  =  coins [ i ]  <  t  ?  coins [ i ]  :  t ;

            // Update the count of remaining coins for the current denomination.
            coins [ i ]  =  coins [ i ]  -  t ;

            // Update the remaining amount after returning coins of this denomination.
            amount  %=  fa [ i ] ;
        }


        // After processing all denominations, print any remaining coins.
        for  ( i = 0 ;  i < 4 ;  i ++ )
        {
            if  ( coins [ i ]  >  0 )
            {
                // Output the coin denomination and its remaining count.
                console.log ( fa [ i ]  +  ' '  +  coins [ i ] ) ;
            }
        }

        // Print an empty line as a separator between test cases.
        console.log ( '' ) ;
    }
}