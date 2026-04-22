// This JavaScript file processes numerical input data according to a specific algorithm.
// It reads input from standard input, performs calculations, and outputs a single result.


function    Main  (  input  )    {

    // Step 1: Parse the input string.
    // The input is expected to be a multi-line string.
    var    data    =    input .split   (   "\n"   )    ;

    // Step 2: Extract the number of iterations from the first line.
    var    n    =    data  [  0  ]    ;

    // Step 3: Initialize the primary array 'a' with the remaining data.
    // This array will be modified in each iteration of the main loop.
    var    a    =    data .slice   (   1   )    ;


    // Begin the main processing loop.
    // This loop runs 'n' times, transforming array 'a' in each iteration.
    for   (   var    i    =    0   ;    i    <    n   ;    ++i    )    {

        // Initialize a temporary array 'b' to store results for the current iteration.
        var    b    =    [  ]    ;

        // Inner loop: Iterate through array 'a' by taking elements in pairs.
        // The step 'j += 2' ensures we process two elements at a time.
        for   (   var    j    =    0   ;    j    <    a .length   ;    j    +=    2    )    {

            // Conditional logic to determine how to process each pair (a[j], a[j+1]).

            if   (   a  [  j  ]    >    a  [  j  +  1  ]   )    {
                // Case 1: If the first element is greater, push their difference.
                b .push   (   a  [  j  ]    -    a  [  j  +  1  ]   )    ;
            }
            else    if   (   a  [  j  ]    ==    a  [  j  +  1  ]   )    {
                // Case 2: If both elements are equal, push the first element (or second, as they are same).
                b .push   (   a  [  j  ]   )    ;
            }
            else    {
                // Case 3: If the second element is greater, push their difference (second minus first).
                b .push   (   a  [  j  +  1  ]    -    a  [  j  ]   )    ;
            }
        } // End of inner loop (j).

        // After processing all pairs, update array 'a' with the new results from 'b'.
        a    =    b    ;

    } // End of outer loop (i).


    // Final step: After all iterations, print the first element of the resulting array 'a'.
    console .log   (   a  [  0  ]   )    ;

} // End of Main function definition.


// This line calls the Main function, providing it with input read from standard input.
// It uses the 'fs' (file system) module to read the content of '/dev/stdin' as UTF-8.
Main   (   require  (  "fs"  ) .readFileSync   (   "/dev/stdin"  ,  "utf8"   )   )    ;