x = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( / \s / ) ;


/*
 * This array 'y' contains a sequence of integers
 * from one to ten, inclusive.
 */
y = [ 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 ] ;


// Main loop begins here.
// It iterates through the 'x' array, processing elements
// in groups of three. The loop variable 'i' is incremented by 3
// in each iteration to move to the next group.
for ( i = 0 ; i < x . length - 1 ; i += 3 )
{

    // A counter variable, initialized to zero for each group.
    // This counter will track how many times a specific condition is met
    // within the inner loop.
    count = 0 ;


    // Inner loop: This loop iterates through the 'y' array.
    // It checks each element of 'y' against a set of conditions
    // derived from the current group of 'x' elements.
    for ( j = 0 ; j < 10 ; j ++ )
    {

        // The core conditional statement.
        // It checks four conditions:
        // 1. y[j] is less than or equal to 20 minus the sum of (x[i]*1) and (x[i+1]*1).
        // 2. y[j] is not equal to x[i+2].
        // 3. y[j] is not equal to x[i+1].
        // 4. y[j] is not equal to x[i].
        // All conditions must be true for the block to execute.
        if ( y [ j ] <= 20 - ( x [ i ] * 1 + x [ i + 1 ] * 1 )  &&  y [ j ] != x [ i + 2 ]  &&  y [ j ] != x [ i + 1 ]  &&  y [ j ] != x [ i ] )
        {
            // If all conditions in the 'if' statement are met,
            // the counter is incremented by one.
            count ++ ;
        } // End of the inner 'if' block.
    } // End of the inner 'for' loop (j).


    // After the inner loop completes, this 'if-else' block
    // evaluates the final value of 'count' for the current group.
    if ( count >= 4 )
    {
        // If 'count' is four or greater,
        // the string "Yes" is printed to the console.
        console . log ( "Yes" ) ;
    }
    else
    {
        // Otherwise (if 'count' is less than four),
        // the string "No" is printed to the console.
        console . log ( "No" ) ;
    } // End of the outer 'if-else' block.
} // End of the main 'for' loop (i).