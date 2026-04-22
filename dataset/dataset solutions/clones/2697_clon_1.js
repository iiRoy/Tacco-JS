/*
 * This JavaScript file processes input to determine if an array can be sorted
 * with at most two elements out of place from their original positions.
 * It demonstrates basic array manipulation, sorting, and conditional logic.
 */
function         Main   (   input   )
{
    // First, split the entire input string by newline characters
    // to separate different lines of data.
    input    =    input.split(    "\n"    )    ;


    // The variable 'N' is assigned the value from the first line of input.
    // This typically represents the number of elements in the subsequent data.
    var     N     =     input[0]    ;

    // The second line of input contains space-separated numbers.
    // These are parsed into an array of numbers called 'vals'.
    var     vals    =    input[1].split(    " "    ).map(    Number    )    ;
    // A duplicate of the original array is created and stored in 'org'.
    // This is crucial for comparing against the sorted version later.
    var     org    =    input[1].split(    " "    ).map(    Number    )    ;


    // Initialize a counter to track the number of discrepancies found.
    var     count    =    0    ;

    // Sort the 'vals' array in ascending order.
    // The original array 'org' remains unsorted.
    vals.sort(    )    ;

    // Iterate through the arrays from the first element up to N.
    for    (    var    i    =    0    ;    i    <    N    ;    i++    )
    {
        // Compare the element at the current index in the sorted array
        // with the element at the same index in the original array.
        if    (    vals[i]    !==    org[i]    )
        {
            // If they are not equal, increment the discrepancy counter.
            count++    ;
        }
    }


    // Based on the final count of discrepancies, determine the answer.
    // If 'count' is 0, 1, or 2, it implies "YES"; otherwise, it's "NO".
    var    ans    =    (    count    <=    2    )    ?    "YES"    :    "NO"    ;

    // Output the final determined answer to the console.
    console.log(    ans    )    ;
}

// This line is responsible for reading the input from standard input
// and then invoking the 'Main' function with that input.
Main(    require("fs").readFileSync("/dev/stdin", "utf8")    )    ;