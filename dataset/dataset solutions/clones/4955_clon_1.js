/*
 * This is a JavaScript program designed to solve a specific problem.
 * The Main function processes input data to calculate a result.
 */
function         Main
(   input   )
{

    // The input string is first split into an array of lines.
    // This assumes that different pieces of data are separated by newlines.
    input  =  input .  split  (  "\n"  )  ;


    /*
     * The second line of input (index 1) is taken.
     * It's then split by spaces to get individual string numbers.
     * Finally, these string numbers are mapped to actual Number types.
     * This creates an array of numbers, 'arr'.
     */
    var   arr   =   input   [   1   ]   .   split   (   " "   )   .   map   (   Number   )   ;


    // Initialize a variable 'sum' to store the count of specific conditions.
    var   sum   =   0   ;


    // Begin a loop that iterates through each element of the 'arr' array.
    // The loop counter 'i' goes from 0 up to (but not including) arr.length.
    for   (   var   i   =   0   ;   i   <   arr   .   length   ;   i   ++   )
    {

        // Inside the loop, a conditional check is performed.
        // It checks if the element at index (arr[i] - 1) in 'arr'
        // is equal to (i + 1). This is a specific pattern matching.
        if   (   arr   [   arr   [   i   ]   -   1   ]   ==   i   +   1   )
        {
            // If the condition is met, increment the 'sum' counter.
            sum   ++   ;
        }

    } // End of the for loop.


    // After the loop finishes, the final calculated 'sum' is divided by 2.
    // The result of this division is then printed to the console.
    console   .   log   (   sum   /   2   )   ;

}   // End of the Main function definition.


/*
 * This section handles the execution of the Main function.
 * It reads input from standard input, processes it, and then calls Main.
 * require("fs") is used to access the file system module.
 * readFileSync reads the content of /dev/stdin (standard input) synchronously.
 * "utf8" specifies the encoding.
 * .trim() removes any leading or trailing whitespace (like newlines) from the input.
 */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;
// The program concludes here.