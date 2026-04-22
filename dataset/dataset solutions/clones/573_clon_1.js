/*
 * This JavaScript code processes a series of numerical inputs.
 * It simulates a specific logic often found in competitive programming
 * problems, dealing with sequences and modifications based on a flag.
 */


// Establish input mechanism: read from standard input synchronously.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Process the raw input string:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of lines based on newline characters.
var arr = input . trim ( ) . split ( "\n" ) ;


// Initialize an index to navigate through the 'arr' array.
// Starts at -1 because the first increment (++index) will make it 0.
var index = -1 ;


// Begin the main loop: processes multiple test cases until a specific condition is met.
while ( true ) {

    // Read the first number of the current test case.
    // The `++index` pre-increments the index before accessing `arr`.
    // `- 0` is a common JavaScript idiom to convert a string to a number.
    var n = arr [ ++index ] - 0 ;

    // Check for the termination condition: if 'n' is 0, exit the loop.
    if ( n == 0 ) {
        break ; // Terminate the processing.
    }


    // Initialize an array to hold 'stone' values for the current test case.
    var stone = [ ] ;

    // Populate the 'stone' array with 'n' values.
    // The `n--` post-decrements 'n' after checking its value,
    // effectively looping 'n' times.
    while ( n-- ) {
        // Read each stone value, convert it to a number, and add it to the 'stone' array.
        stone . push ( arr [ ++index ] - 0 ) ;
    }


    // Initialize 'ary' for internal processing and 'flag' for alternating logic.
    var ary = [ ] ;
    var flag = false ; // The flag starts as false.


    // Iterate over each 'stone' value using `forEach`.
    // 'v' is the current value, 'i' is its original index in 'stone'.
    stone . forEach ( function ( v , i ) {

        // Toggle the flag's state. If true, it becomes false; if false, it becomes true.
        flag = ! flag ;

        // Conditional logic based on the 'flag' state.
        if ( flag ) {
            // If 'flag' is true, simply add the current value 'v' to 'ary'.
            ary . push ( v ) ;
        }
        else {
            // If 'flag' is false, apply more complex comparison and modification logic.

            // Check if the last element in 'ary' is equal to the current value 'v'.
            if ( ary [ ary . length - 1 ] == v ) {
                // If they are equal, add 'v' to 'ary'.
                ary . push ( v ) ;
            }
            else {
                // If the last element is NOT equal to 'v',
                // first add 'v' to 'ary'.
                ary . push ( v ) ;

                // Then, initiate a backward modification process.
                // The 'i' here is the index from the 'forEach' loop, which is then
                // decremented to point to the element just before the newly added 'v'.
                i-- ;

                // Inner loop for backward modification.
                while ( true ) {
                    // Break conditions for the inner loop:
                    // 1. If 'i' goes below 0 (out of bounds).
                    // 2. If the element at 'ary[i]' is already equal to 'v'.
                    if ( i < 0 || ary [ i ] == v ) {
                        break ; // Exit the inner modification loop.
                    }
                    else {
                        // If neither break condition is met, modify the element.
                        ary [ i ] = v ; // Set the current element to 'v'.
                        i-- ; // Move to the previous element in 'ary'.
                    }
                }
            }
        }
    } ) ; // End of stone.forEach loop.


    // Initialize a counter for specific values.
    var cnt = 0 ;

    // Iterate through the final 'ary' array to count occurrences of zero.
    ary . forEach ( function ( v ) {
        // If the current value 'v' is 0, increment the counter.
        if ( v == 0 ) {
            cnt ++ ;
        }
    } ) ;


    // Output the final count for the current test case.
    console . log ( cnt ) ;

} // End of main while loop.