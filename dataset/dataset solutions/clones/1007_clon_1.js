/*
 * This is a Type I clone of a JavaScript program.
 * It processes input from stdin, performs a selection sort,
 * and then prints the sorted array and the number of swaps.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 */

let   inputString   =   ''; // Initialize an empty string to accumulate input data.

// Register a callback for when data is received on standard input.
process.stdin.on(
    'data',
    inputStdin  =>  {
    // Append the incoming data chunk to the inputString.
            inputString += inputStdin;
        }
);


// Register a callback for when the standard input stream ends.
process.stdin.on ( 'end', function ( ) {

    // Process the accumulated input string:
    // 1. Remove trailing whitespace from the entire string.
    // 2. Split the string into an array of lines.
    // 3. For each line, remove trailing whitespace.
    inputString = inputString.replace( /\s*$/, '' )
        .split ( '\n' )
        .map ( str => str.replace ( /\s*$/, '' ) );


    // Call the selection sort function with the second line of input.
    // The second line is expected to contain space-separated numbers.
    // 1. Get the second line (index 1).
    // 2. Split it by spaces.
    // 3. Convert each resulting string to a Number.
    selectionSort ( inputString [ 1 ] . split ( ' ' ) . map ( str => Number ( str ) ) );
} );


/*
 * Defines the selectionSort function.
 * This function sorts an array of numbers in ascending order
 * and counts the number of swaps performed.
 * It then prints the sorted array and the swap count to the console.
 */
const   selectionSort   =   ( arr )   =>   {
    let   swap   =   0; // Initialize a counter for the number of swaps.

    // Outer loop: iterate from the first element to the second-to-last.
    for   ( let   i = 0;   i < arr.length;   i++ )   {
        let   minj   =   i; // Assume the current element is the minimum in the unsorted part.

        // Inner loop: find the smallest element in the unsorted part of the array.
        for   ( let   j = i;   j < arr.length;   j++ )   {
            // If a smaller element is found, update minj.
            if   ( arr [ j ]   <   arr [ minj ] )   {
                minj   =   j;
            }
        }

        // Store the values at the current position 'i' and the minimum position 'minj'.
        const   a   =   arr [ i ];
        const   b   =   arr [ minj ];

        // If the element at 'i' is not already the minimum, perform a swap.
        if   ( a   !==   b )   {
            arr [ minj ]   =   a; // Place the original element at 'i' into the minimum position.
            arr [ i ]   =   b;   // Place the minimum element into the current position 'i'.
            swap++;              // Increment the swap counter.
        }
    }

    // After sorting, print the sorted array elements joined by spaces.
    console.log ( arr . join ( ' ' ) );

    // Print the total number of swaps performed during the sort.
    console.log ( swap );
};