/*
 * This is the main function responsible for processing the input data.
 * It simulates a selection process from two distinct lists based on time constraints.
 * The goal is to maximize the number of items selected without exceeding a total time limit.
 */
function         main( input )
{

    // Step 1: Process the raw input string.
    // The input is expected to be multi-line, so we split it by newline characters.
    input = input.split( '\n' ) ;


    // Step 2: Parse the first line of input.
    // This line contains three space-separated integers: n, m, and k.
    // n: represents the initial number of elements in array 'a'.
    // m: represents the initial number of elements in array 'b'.
    // k: represents the maximum allowed total time for selections.
    const [ n , m , k ] = input[0] . split( ' ' ) . map( x => Number( x ) ) ;


    // Step 3: Parse the second line of input for array 'a'.
    // The elements are space-separated, converted to numbers, and then the array is reversed.
    // Reversing allows us to efficiently use `pop()` to get the smallest available element,
    // assuming the input arrays were originally sorted in ascending order (which is typical for such problems).
    const a = input[1] . split( ' ' ) . map( x => Number( x ) ) . reverse() ;


    // Step 4: Parse the third line of input for array 'b'.
    // Similar to array 'a', elements are converted to numbers and the array is reversed.
    const b = input[2] . split( ' ' ) . map( x => Number( x ) ) . reverse() ;


    // Initialize a counter to keep track of how many items have been considered/selected.
    let count = 0 ;

    // Initialize a variable to accumulate the total time spent on selected items.
    let totalTime = 0 ;


    // Main loop: Continue selecting items as long as the total time does not exceed 'k'.
    while ( totalTime <= k )
    {

        // Increment the counter for each iteration, signifying an attempt to select an item.
        count++ ;


        // Check for termination condition: If both arrays are empty, no more items can be selected.
        if ( ( a.length === 0 ) && ( b.length === 0 ) )
        {
            break ; // Exit the loop as there's nothing left to take.
        }


        // Declare a variable to store the time value of the next item to be considered.
        let next ;


        // Decision logic: Determine which item to take next based on availability and value.
        if ( a.length === 0 )
        {
            // If array 'a' is empty, we must take from array 'b'.
            // `pop()` removes and returns the last element, which is the smallest due to reversal.
            next = b.pop() ;
        }
        else if ( b.length === 0 )
        {
            // If array 'b' is empty, we must take from array 'a'.
            next = a.pop() ;
        }
        else if ( a[ a.length - 1 ] <= b[ b.length - 1 ] )
        {
            // If both arrays have elements, compare their smallest available items.
            // (a[a.length - 1] is the smallest in 'a' after reversal, same for 'b').
            // If 'a's smallest is less than or equal to 'b's smallest, take from 'a'.
            next = a.pop() ;
        }
        else
        {
            // Otherwise, 'b's smallest element is smaller than 'a's, so take from 'b'.
            next = b.pop() ;
        }

        // Add the time of the selected item to the running total.
        totalTime += next ;
    }


    // The `count` variable is incremented one extra time in the last iteration before the loop condition fails.
    // Therefore, subtract 1 from `count` to get the actual number of items successfully taken within the `k` time limit.
    console.log( count - 1 ) ;
}


// Entry point for the program: Read input from standard input and pass it to the main function.
// This setup is common in competitive programming environments using Node.js.
main ( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;