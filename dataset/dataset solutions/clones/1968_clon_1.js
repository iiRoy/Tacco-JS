/*
 * This is a JavaScript program designed to process a specific input format.
 * It counts occurrences of numbers within a sorted array.
 * The input is expected to contain a number N on the first line,
 * followed by N space-separated numbers on the second line.
 * The program then outputs the frequency of each number from 1 to N.
 */

// Define the main function that takes 'input' as its argument.
function   Main   (   input   )   {

    // Split the input string into an array of lines.
    // The input is typically provided as a single string with newline characters.
    var   lines   =   input .   split   (   '\n'   )   ;

    // Parse the first line to get the total number of elements, N.
    // N represents the upper bound for the numbers we are counting.
    var   N   =   Number   (   lines[0]   )   ;

    // Split the second line by spaces to get an array of strings (A).
    // These strings will later be converted to numbers for comparison.
    var   A   =   lines[1] .   split   (   ' '   )   ;

    // Sort the array A in ascending order.
    // Since A contains strings, this is a lexicographical sort.
    // Numeric conversion is done inside the loop for comparisons.
    A .   sort   (   )   ;

    // Initialize an index variable for iterating through the sorted array A.
    // This index will keep track of our current position in array A.
    var   index   =   0   ;

    // Declare a variable 'count' to store the frequency of each number.
    // It will be reset for each number we are looking for.
    var   count   ;

    // Loop from 1 up to N (inclusive) to check for each expected number.
    // We are looking for the frequency of numbers 1, 2, ..., N.
    for   (   var   i   =   1   ;   i   <=   N   ;   i   ++   )   {
        // Reset the count for the current number 'i'.
        // This ensures we start fresh for each new number.
        count   =   0   ;

        // While the current element in A (converted to a number) matches 'i'
        // AND we haven't gone past the end of the array A...
        while   (   Number   (   A[index]   )   ==   i   &&   index   <   N   )   {
            // Increment the array index to move to the next element.
            index   ++   ;

            // Increment the count for the current number 'i'.
            // This means we found another occurrence of 'i'.
            count   ++   ;
        }

        // Output the final count for the number 'i' to the console.
        // Each number's frequency is printed on a new line.
        console .   log   (   count   )   ;
    }

} // End of the Main function block.


// This section handles reading input from standard input and calling the Main function.
// It uses Node.js 'fs' module to read the entire file content.
// The file path "/dev/stdin" is a common convention for standard input in competitive programming environments.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of the JavaScript program.