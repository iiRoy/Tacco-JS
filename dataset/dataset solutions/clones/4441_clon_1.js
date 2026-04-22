/*
 * This is a JavaScript program designed to process input and generate a specific output pattern.
 * It reads dimensions (height 'h', width 'w'), a count 'n', and then a sequence of numbers.
 * The core logic involves filling an array 'a' based on the input sequence and then
 * arranging elements from 'a' into a grid-like string 'ans' with alternating row directions.
 */

// Define the main function that encapsulates the program's logic
function    Main    (    input    )        {

    // Step 1: Process the raw input string
    // Split the entire input string by newline characters to get individual lines.
    input  =  input.split ( "\n" ) ;

    // Parse the first line to get height (h) and width (w)
    // The first line is expected to contain "h w" separated by a space.
    var h    =    parseInt ( input[0].split ( " " ) [0] ) ; // Get height
    var w    =    parseInt ( input[0].split ( " " ) [1] ) ; // Get width

    // Parse the second line to get the count 'n'
    // The second line contains 'n'.
    var n    =    parseInt ( input[1] ) ;

    // Step 2: Prepare the data for array 'a' construction
    // The third line contains space-separated numbers that determine the contents of 'a'.
    tmp = input[2].split ( " " ) ; // Split the third line into an array of strings

    // Initialize an empty array 'a' which will store the final sequence of numbers.
    a    =    new    Array ( ) ;

    // Step 3: Populate array 'a'
    // This loop iterates 'n' times, processing each number in 'tmp'.
    for    (    let    i    =    0;    i    <    n;    i++    )    {
        // Convert the current string from 'tmp' to an integer 'x'.
        var    x    =    parseInt ( tmp[i] ) ;

        // For each 'x', push the value (i+1) 'x' times into array 'a'.
        // This effectively expands the input sequence.
        for    (    let    j    =    0;    j    <    x;    j++    )    {
            a.push ( i    +    1 ) ;
        }
    }


    // Step 4: Construct the output string 'ans'
    // Initialize an empty string for the final output.
    var    ans    =    ""    ;

    // Initialize an array 'anssub' to hold each row's string representation.
    // Fill it with empty strings for 'h' rows.
    anssub    =    new    Array ( h ) . fill ( "" ) ;

    // Loop through each row (from 0 to h-1)
    for    (    let    i    =    0;    i    <    h;    i++    )    {
        // Start each row string with the first element for that row.
        // The elements for row 'i' start at index 'i * w' in array 'a'.
        anssub[i]    =    a[i    *    w]    ;

        // Loop through the remaining elements for the current row (from 1 to w-1)
        for    (    let    j    =    1;    j    <    w;    j++    )    {
            // Check if the current row index 'i' is even.
            if    (    i    %    2    ==    0    )    {
                // If even, append elements normally (left-to-right).
                anssub[i]    =    anssub[i]    +    " "    +    a[i    *    w    +    j]    ;
            }    else    {
                // If odd, prepend elements (right-to-left) to reverse the order.
                anssub[i]    =    a[i    *    w    +    j]    +    " "    +    anssub[i]    ;
            }
        }

        // After constructing the row string, append a newline character.
        anssub[i]    =    anssub[i]    +    "\n"    ;

        // Add the completed row string to the total answer string.
        ans    +=    anssub[i]    ;
    }

    // Step 5: Final cleanup of the output string
    // Check if the last character of 'ans' is a newline.
    if    (    ans.slice ( -1 )    ==    "\n"    )    {
        // If it is, remove the trailing newline character.
        ans    =    ans.slice ( 0,    -1 )    ;
    }

    // Step 6: Print the final result to the console
    // Use console.log with a format specifier for string output.
    console.log ( '%s',    ans )    ;

}


// Execute the Main function
// Read input synchronously from standard input using Node.js 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin",    "utf8" ) ) ;