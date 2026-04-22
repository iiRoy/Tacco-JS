/*
 * This JavaScript file processes numerical data from standard input.
 * It demonstrates array manipulation, conditional logic, and iterative processing.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All variable names, function calls, operators, and expressions are identical
 * to the original source code.
 */

//  Initialize the 'input' variable by reading the entire content
//  of '/dev/stdin' as a UTF-8 encoded string.
var input =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


//  Process the raw input string:
//  1. Trim leading/trailing whitespace.
//  2. Split the string into an array of lines based on newline characters.
//  3. Map each resulting string element to its numerical representation.
var arr = input . trim ( ) . split ( "\n" ) . map ( Number ) ;


//  Declare and initialize an 'index' variable, used for traversing the 'arr' array.
var index = -1 ;

//  The main processing loop. It continues indefinitely until an explicit 'break' statement is encountered.
while ( true )
{
    //  Fetch the next number 'n' from the 'arr' array.
    //  The '++index' pre-increments the index before accessing the array element.
    var n = arr [ ++ index ] ;

    //  Check if the retrieved number 'n' is 0.
    //  A value of 0 signifies the end of a data block or the entire input.
    if ( n == 0 )
        break ; //  Exit the 'while' loop if 'n' is 0.

    //  Declare an empty array 'ary' to store processed values for the current data block.
    var ary = [ ] ;

    //  Initialize a boolean 'flag' variable to control alternating behavior within the loop.
    var flag = false ;

    //  Declare 'v' and 'i' variables. Their values will be assigned within the upcoming loop.
    var v ;
    var i ;

    //  A 'for' loop that iterates 'n' times, processing 'n' elements for the current data block.
    for ( var k = 0 ; k < n ; k ++ )
    {
        //  Retrieve the next value from 'arr' using the incremented 'index'.
        v = arr [ ++ index ] ;

        //  Assign the current loop counter 'k' to 'i'.
        i = k ;

        //  Toggle the 'flag' variable (true becomes false, false becomes true).
        flag = ! flag ;

        //  Conditional logic based on the current state of the 'flag'.
        if ( flag )
        {
            //  If 'flag' is true, simply append the current value 'v' to 'ary'.
            ary . push ( v ) ;
        }
        else
        {
            //  If 'flag' is false, more complex logic is executed.
            //  Check if the last element in 'ary' is identical to 'v'.
            if ( ary [ ary . length - 1 ] == v )
            {
                //  If they are equal, push 'v' onto 'ary' again.
                ary . push ( v ) ;
            }
            else
            {
                //  If the last element is not equal to 'v',
                //  first push 'v' to 'ary'.
                ary . push ( v ) ;
                i -- ; //  Decrement 'i' to point to the element just before the newly added 'v'.

                //  An inner 'while' loop for backward propagation.
                while ( true )
                {
                    //  Break conditions for this inner loop:
                    //  1. If 'i' becomes less than 0 (meaning we've gone past the start of 'ary').
                    //  2. If the element at 'ary[i]' is already equal to 'v'.
                    if ( i < 0 || ary [ i ] == v )
                        break ;
                    else
                    {
                        //  If neither break condition is met,
                        //  update the element at 'ary[i]' to 'v'.
                        ary [ i ] = v ;
                        i -- ; //  Move to the previous element in 'ary'.
                    }
                } //  End of inner while loop
            } //  End of 'else' block for checking last element equality.
        } //  End of 'else' block for 'flag' condition.
    } //  End of 'for' loop iterating 'n' times.

    //  Initialize a counter for zeros.
    var cnt = 0 ;

    //  Iterate over each element in the 'ary' array.
    ary . forEach ( function ( v ) {
        //  If the current element 'v' is 0, increment the 'cnt'.
        if ( v == 0 )
            cnt ++ ;
    } ) ;

    //  Output the final count of zeros for the current data block to the console.
    console . log ( cnt ) ;

} //  End of main 'while' loop.