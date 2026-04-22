/*
 * This file contains a JavaScript implementation of the Selection Sort algorithm.
 * It reads input from /dev/stdin, sorts an array of numbers, and prints the sorted array
 * along with the number of swaps performed.
 */


    const   config  =   {

        input: '/dev/stdin',    // Standard input path for the program.
        newline: '\n'           // The newline character used to split input lines.

    }; // End of configuration object declaration.


// Read the entire content of the standard input file,
// decode it as UTF-8, and then split it into an array of strings
// based on the configured newline character.
const   line    =   require (   'fs'    )   .   readFileSync (  config  .   input   ,   'utf-8' )   .   split   (   config  .   newline )   ;



// Define the selectionSort function using an arrow function syntax.
// This function takes an array 'arr' as input, sorts it in ascending order
// using the Selection Sort algorithm, and returns the total number of swaps performed.
const   selectionSort   =   arr =>  {

    // Initialize a counter for the number of actual swaps made during the sorting process.
    let count   =   0   ;

    // The outer loop iterates through each element of the array from the beginning
    // up to the second-to-last element. 'i' represents the current position to fill.
    for (   let i   =   0   ;   i   <   arr .   length  ;   i   ++  )   {

        // Assume that the element at the current position 'i' is the minimum
        // in the unsorted portion of the array.
        let min =   i   ;

        // The inner loop searches for the actual minimum element in the unsorted portion
        // of the array, starting from the current position 'i' to the end.
        for  (  let j   =   i   ;   j   <   arr .   length  ;   j   ++  )   {

            // Compare the current element (arr[j]) with the assumed minimum (arr[min]).
            if  (   arr [   j   ]   <   arr [   min   ]   )   {

                min =   j   ; // If a smaller element is found, update 'min' to its index.

            }   // End of the if condition for comparison.

        }   // End of the inner loop, after finding the true minimum in the unsorted part.


        // Perform the swap operation to place the found minimum element at its correct sorted position 'i'.
        const   tmp =   arr [   i   ]   ;       // Temporarily store the element at position 'i'.
        arr [   i   ]   =   arr [   min   ]   ;   // Move the minimum element to position 'i'.
        arr [   min   ] =   tmp   ;           // Place the original element from 'i' into the 'min' position.

        // Increment the swap counter only if a swap actually occurred (i.e., if the minimum
        // element was not already at the current position 'i').
        if  (   i   !== min   )   count   ++  ;

    }   // End of the outer loop, once all elements have been placed correctly.


    // After sorting is complete, convert each number in the sorted array to a string
    // and then join them together with a space in between, finally printing to console.
    console .   log (   arr .   map (   x   =>  x   .   toString (  )   )   .   join (   ' '   )   )   ;


    // Return the total number of swaps performed during the sorting process.
    return  count   ;

}   ; // End of the selectionSort function definition.


// The main execution block:
// This line takes the second line of input (index 1 from the 'line' array),
// splits it by spaces to get individual number strings,
// converts each string into an integer using parseInt,
// then passes the resulting array of integers to the selectionSort function.
// Finally, it prints the return value of selectionSort (which is the swap count) to the console.
console .   log (   selectionSort (   line [   1   ]   .   split (   ' '   )   .   map (   x   =>  parseInt (   x   )   )   )   )   ;