/*
 * This JavaScript program is designed to read input from standard input,
 * process it through a series of calculations, and then output a specific result.
 * It appears to be structured to handle multiple test cases or data sets,
 * stopping when a specific sentinel condition is met.
 */


// The 'fs' module is imported to enable file system operations.
// Specifically, 'readFileSync' is used to synchronously read the entire
// content of '/dev/stdin' (standard input) as a UTF-8 encoded string.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// The raw input string is first trimmed to remove any leading or trailing whitespace.
// Then, it is split into an array of strings, where each element represents a line
// from the original input, separated by newline characters. This array is named 'Arr'.
var   Arr   =   (   input.trim ( )   ) . split ( "\n" ) ;


// This 'while' loop establishes the main processing flow. It is set to run indefinitely
// until an explicit 'break' statement is encountered within its body,
// typically triggered by a specific input pattern.
while   (   true   )
{

    // In each iteration, the first line is removed from the 'Arr' array using 'shift()'.
    // This line is expected to contain three space-separated numbers (N, M, P).
    // It's then split by spaces, and 'map(Number)' converts each string part into a numerical value.
    var   nmp   =   (   Arr.shift ( )   ) . split ( " " ) . map ( Number ) ;


    // This 'if' statement checks for the termination condition of the loop.
    // If all three numbers (N, M, P) extracted from the current line are zero,
    // it signals the end of the input or a specific processing phase, and the loop is exited.
    if   (   nmp [0]   ==   0   &&   nmp [1]   ==   0   &&   nmp [2]   ==   0   )
    {
        break   ; // Terminate the infinite loop
    }


    // The extracted numerical values from 'nmp' are assigned to individual variables
    // for clarity and easier access. Note that 'm' is decremented by 1,
    // implying it's used as a zero-based index later in array access.
    var   n   =   nmp [0]   ;
    var   m   =   nmp [1]   -   1   ; // Adjusting 'm' for 0-based array indexing
    var   p   =   nmp [2]   ;


    // An empty array named 'arr' is initialized to store a series of values.
    // A variable 'sum' is also initialized to zero; it will accumulate a weighted total.
    var   arr   =   [   ]   ;
    var   sum   =   0   ;


    // A 'for' loop is initiated to iterate 'n' times.
    // This loop is responsible for reading 'n' subsequent lines of input.
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )
    {
        // For each iteration, another line is shifted from 'Arr'.
        // The '- 0' operation is a common JavaScript trick to explicitly convert the string to a number.
        // This numerical value 'v' is then added to the 'arr' array.
        var   v   =   Arr.shift ( )   -   0   ; // Read next value and convert to number
        arr.push ( v ) ;

        // The value 'v' is multiplied by 100 before being added to the 'sum'.
        // This suggests that 'v' might represent a percentage or a base unit that needs scaling.
        sum   +=   (   v   *   100   )   ; // Accumulate sum with a factor of 100
    }


    // After processing all 'n' values, the 'sum' is adjusted based on the 'p' value.
    // This calculation effectively applies a percentage reduction (100-p)% to the total sum.
    sum   =   sum   *   (   100   -   p   )   /   100   ;


    // A variable 'ans' (answer) is initialized to zero. This will hold the final computed result.
    var   ans   =   0   ;


    // This conditional statement checks if the element at index 'm' in the 'arr' array is not zero.
    // This check prevents division by zero errors.
    if   (   arr [m]   !=   0   )
    {
        // If 'arr[m]' is not zero, the 'ans' is calculated by dividing the adjusted 'sum' by 'arr[m]'.
        // 'Math.floor()' is used to ensure that the result is an integer, truncating any decimal part.
        ans   =   Math.floor (   sum   /   arr [m]   )   ;
    }


    // Finally, the calculated 'ans' value is printed to the console.
    console.log ( ans ) ;
} // End of the main processing loop.