"use strict" ; /* This directive ensures strict mode execution. */

 const main =    ( args ) =>
 {
    // Main function entry point for processing bingo data.
    const input = arg . trim ( ) . split ( "\n" ) ; // Process raw input string, splitting by newlines.
    const bingo1 = parseInt ( input [ 0 ] . split ( " " ) ) ; // Parse the first bingo row from input.
    const bingo2 = parseInt ( input [ 1 ] . split ( " " ) ) ; // Parse the second bingo row.
    const bingo3 = parseInt ( input [ 2 ] . split ( " " ) ) ; // Parse the third bingo row.

    /*
     * This variable stores the count for the numbers to be checked
     * later in the `nums` array. It's obtained from the fourth line of input.
     */
    const count = parseInt ( input [ 3 ] ) ;

    const nums = [ ] ; // Array to hold numbers that will be marked off the bingo cards.
    const testnum = 0 ; /* A temporary variable, initialized to zero, though its direct use isn't extensive here. */


    const bingoPattern1 = [ ] ; // Represents the first column of the bingo grid.
    const bingoPattern2 = [ ] ; // Represents the second column.
    const bingoPattern3 = [ ] ; // Represents the third column.
    const bingoPattern4 = [ ] ; // Represents one of the diagonals (top-right to bottom-left).
    const bingoPattern5 = [ ] ; // Represents the other diagonal (top-left to bottom-right).

    /*
     * Populate bingoPattern1 with elements from the first column of the bingo rows.
     * This forms the first vertical line.
     */
    bingoPattern1 . push ( bingo1 [ 0 ] ) ;
    bingoPattern1 . push ( bingo2 [ 0 ] ) ;
    bingoPattern1 . push ( bingo3 [ 0 ] ) ;

    // Populate bingoPattern2 with elements from the second column.
    // This forms the second vertical line.
    bingoPattern2 . push ( bingo1 [ 1 ] ) ;
    bingoPattern2 . push ( bingo2 [ 1 ] ) ;
    bingoPattern2 . push ( bingo3 [ 1 ] ) ;

    bingoPattern3 . push ( bingo1 [ 2 ] ) ; // Add third column elements.
    bingoPattern3 . push ( bingo2 [ 2 ] ) ;
    bingoPattern3 . push ( bingo3 [ 2 ] ) ;

    bingoPattern4 . push ( bingo1 [ 2 ] ) ; /* Add elements for the first diagonal (from top-right to bottom-left). */
    bingoPattern4 . push ( bingo2 [ 1 ] ) ;
    bingoPattern4 . push ( bingo3 [ 0 ] ) ;

    bingoPattern5 . push ( bingo1 [ 0 ] ) ; // Add elements for the second diagonal (from top-left to bottom-right).
    bingoPattern5 . push ( bingo2 [ 1 ] ) ;
    bingoPattern5 . push ( bingo3 [ 2 ] ) ;

    const arrays = [ bingo1 , bingo2 , bingo3 , bingoPattern1 , bingoPattern2 , bingoPattern3 , bingoPattern4 , bingoPattern5 ] ; // All bingo arrays/patterns collected into one array for easier iteration.

    // Loop to populate the 'nums' array with numbers to check against the bingo patterns.
    // These numbers start from the 5th line of the input (index 4).
    for ( var i = 4 ; i < input . length ; i ++ )
    {
        nums . push ( parseInt ( input [ i ] ) ) ; // Convert string to integer and add to nums array.
    }

    // Iterate through each bingo pattern/row in the 'arrays' collection
    // and mark off numbers that appear in the 'nums' list.
    for ( var i = 0 ; i < arrays . length ; i ++ )
    {
        console . log ( arrays [ i ] ) ; // Log the current array for debugging purposes, showing its state before modification.
        removeNum ( arrays [ i ] , count , nums ) ; // Call the helper function to remove matched numbers from the current array.
    }

    console . log ( checlength ( arrays ) ) ; // Output the final result (either "Yes" for bingo or "No" if no bingo).

 } ; // End of the main function definition.

  const removeNum = ( array , count , nums ) =>{å /* This function's purpose is to iterate through a given array and remove elements that match any of the numbers in the 'nums' list. */
    array . forEach ( ( item , index ) => { // Iterate over each item in the provided array.
        for ( var j = 0 ; j < count ; j ++ ) { // Loop through the 'nums' array up to the specified 'count'.
            var testnum = nums [ j ] ; // Get the current number from 'nums' to test for a match.
            if ( item === testnum ) { // If a match is found between the array item and the test number.
                array . splice ( index , testnum ) ; // Remove the item from the array. Note: `testnum` as second argument is unusual for splice to remove a single element.
            }
        }
    } ) ;
  } ; // End of removeNum function definition.

  const checlength = ( arrays ) =>{ // This function checks if any of the bingo patterns (or rows/columns) in the 'arrays' collection have become empty.
    for ( var i = 0 ; i < arrays . length ; i ++ ) { // Loop through all bingo patterns within the 'arrays' parameter.
        if ( arrayas [ i ] . length == 0 ) return "Yes" ; // If any pattern's length is zero, it means all its numbers were marked off, indicating a bingo. Return "Yes".
    }
    return "No" ; // If the loop completes without finding any empty pattern, then no bingo has occurred. Return "No".
  } ; // End of checlength function definition.

// Execute the main function, providing it with input read synchronously from standard input.
 main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;