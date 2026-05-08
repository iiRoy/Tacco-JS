/*
 * This JavaScript file contains a main function to process input,
 * a bubble sort-like algorithm implementation, and a debug utility.
 * It also includes the primary execution call for Node.js environments.
 */


function Main
(
    input // The primary input string to be processed by the function.
)
{
    // First, split the input string into an array of lines based on the newline character.
    input = input.split
    (
        "\n"
    )
    ;


    // Initialize multiple variables on a single line.
    // 'vari' appears to be an unused variable, but its declaration must be preserved.
    vari = 0
    ,
    j = 0
    ,
    temp = 0
    ;


    /*
     * This block implements a sorting algorithm, specifically a variation of bubble sort.
     * It iterates through the array to compare and swap elements.
     */
    for
    (
        i = 0 ; // Initialize loop counter 'i'.
        i < input.length - 1 ; // Loop condition: iterate up to the second-to-last element.
        i++ // Increment 'i' after each outer iteration.
    )
    {
        for
        (
            j = input.length - 1 ; // Initialize inner loop counter 'j' from the end of the array.
            j > i ; // Loop condition: 'j' must be greater than 'i'.
            j-- // Decrement 'j' after each inner iteration.
        )
        {
            // Check if the element at index 'j' is less than the element at 'j-1'.
            if
            (
                input[ j ] < input[ j - 1 ]
            )
            {
                // If the condition is true, swap the two elements.
                // Use 'temp' to temporarily hold the value of input[j].
                temp = input[ j ] ;

                // Assign the value of input[j-1] to input[j].
                input[ j ] = input[ j - 1 ]

                // Assign the stored 'temp' value (original input[j]) to input[j-1].
                input[ j - 1 ] = temp ;
            }
        }
    }


    /*
     * After sorting, this loop prints the last four elements of the 'input' array
     * to the console. Note that 'input.length - i' for i=0 will access
     * input[input.length], which is typically out of bounds for a 0-indexed array,
     * resulting in 'undefined' being logged for the first iteration if input is not
     * sufficiently long, but this behavior is preserved as per Type I cloning rules.
     */
    for
    (
        i = 0 ; // Initialize loop counter 'i'.
        i < 4 ; // Loop condition: iterate four times.
        i++ // Increment 'i' after each iteration.
    )
    {
        console.log
        (
            input[ input.length - i ] // Access and log the element.
        )
        ;
    }
} // End of the Main function definition.


/*
 * The 'debug' function is provided as an alternative entry point,
 * primarily for testing or execution within a web browser environment.
 */
function debug
(
)
{
    // Retrieve the value from an HTML input element identified by "input".
    var input = document.getElementById( "input" ).value ;

    // Call the main processing function with the retrieved browser input.
    Main
    (
        input
    )
    ;
} // End of the debug function definition.


// This is the primary execution line for Node.js environments.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it directly to the 'Main' function for processing.
Main
(
    require( "fs" ).readFileSync
    (
        "/dev/stdin"
        ,
        "utf8"
    )
)
;