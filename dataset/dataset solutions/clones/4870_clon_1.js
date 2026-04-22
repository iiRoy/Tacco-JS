/*
 * This script processes numerical input.
 * It reads a string of space-separated numbers,
 * converts them to integers, sorts them,
 * and then checks a specific condition.
 */


// Define the main function to encapsulate the logic.
function   Main   ( input   )   {

    // Split the input string by spaces to get an array of string numbers.
    // Assign the processed array back to the 'input' variable.
    input  =  input . split ( " " ) ;

    /*
     *  Convert each string element in the 'input' array to an integer.
     *  The 'map' method creates a new array with the results of calling a provided function
     *  on every element in the calling array.
     *  parseInt(n, 10) ensures the number is parsed in base 10.
     */
    const   map1   =   input . map (  n  =>  parseInt (  n ,  10  )  ) ;


    // Sort the array of integers in ascending order.
    // The comparison function (a, b) => a - b achieves this.
    map1 . sort (  ( a , b )  =>  a - b  ) ;


    // Check if the sum of the two smallest numbers equals the largest number.
    // Use a ternary operator to output "Yes" or "No".
    console . log (   map1 [ 0 ]  +  map1 [ 1 ]  ===  map1 [ 2 ]  ?  "Yes"  :  "No"   ) ;

} // End of Main function definition.


// Execute the Main function with input read from standard input.
// This line uses Node.js specific modules to read file content.
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;