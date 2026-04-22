/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original.
 *
 * Only whitespace (spaces, tabs, newlines) and comments have been altered.
 * The goal is to make the code visually distinct while maintaining
 * identical logical and structural properties.
 */

// Define the bomb function which processes a string 'x'
function    bomb  (  x  )
{
    // Continuously remove sequences of four or more identical digits (1s, 2s, or 3s)
    while  (   /1{4,}|2{4,}|3{4,}/.test  (  x  )   )
    {
        // Replace all occurrences of such sequences with an empty string
        x = x.replace  (  /1{4,}|2{4,}|3{4,}/g  ,  ""  )  ;
    }

    // Update the global minimum length if the current 'x' is shorter
    min = Math.min  (  min  ,  x.length  )  ;
}


/*
 * Main program execution starts here.
 * It reads input, processes it in a loop, and outputs results.
 */

// Read the entire input from stdin, decode as UTF-8
var   input   =   require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  ;


// Trim whitespace from input and split into an array of lines
var   Arr   =   (   input.trim  (  )   )  .  split  (  "\n"  )  ;


// Main processing loop; continues until a specific condition is met
while  (  true  )
{
    // Extract the first number from the array, converting it to a numeric type
    var   N   =   Arr.shift  (  )   -   0  ;

    // If N is 0, it signifies the end of input, so break the loop
    if  (   N   ==   0   )
        break  ;


    // Initialize an empty array to store the current set of numbers
    var   arr   =   [  ]  ;


    // Populate 'arr' with 'N' numbers from the input array
    for  (   var   i   =   0   ;   i   <   N   ;   i   ++   )
    {
        // Extract and convert each number
        var   v   =   Arr.shift  (  )   -   0  ;

        // Add the number to the current array
        arr.push  (  v  )  ;
    }


    // Initialize 'min' to a very large value for finding the minimum length
    var   min   =   Infinity  ;

    // Convert the array of numbers into a single string
    var   str   =   arr.join  (  ""  )  ;


    // Iterate through each element of the array to simulate modifications
    for  (   var   i   =   0   ;   i   <   N   ;   i   ++   )
    {
        // Create two copies of the array for two different modification scenarios
        var   A   =   arr.slice  (  )  ;
        var   B   =   arr.slice  (  )  ;

        // Scenario 1: If not the last element, replace current element with the next
        if  (   i   <   N   -   1   )
            A  [  i  ]   =   A  [  i  +  1  ]  ;

        // Scenario 2: If not the first element, replace current element with the previous
        if  (   i   >   0   )
            B  [  i  ]   =   B  [  i  -  1  ]  ;

        // Apply the 'bomb' function to the string representation of array A
        bomb  (  A.join  (  ""  )  )  ;

        // Apply the 'bomb' function to the string representation of array B
        bomb  (  B.join  (  ""  )  )  ;
    }

    // Output the calculated minimum length for the current set of input numbers
    console.log  (  min  )  ;
}