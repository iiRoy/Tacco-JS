/*
 * This JavaScript code defines a function named 'Main'
 * which processes an input string of space-separated numbers.
 * It then performs calculations based on these numbers
 * and outputs the results to the console.
 */


function     Main  (  input   )     {

    // The 'arr' variable will store the parsed integer values.
    // It's assigned the result of a two-step process on the 'input' string.
    arr   =   input

        // First, split the input string into an array of substrings
        // using a single space character as the delimiter.
        .  split (  " "  )


        // Second, use the 'map' method to transform each substring
        // in the array into an integer.
        .  map   (

            // This anonymous function is the callback for 'map'.
            // It takes an element 'e' (which is a string)
            // and returns its integer representation.
            function  (  e  )  {

                return   parseInt (  e  )  ; // Convert string to integer.

            }

        )  ; // End of the 'map' call and 'arr' assignment.


    // Now, print two calculated values to the console.
    // These values are separated by a space character.
    console .  log (

        // The first value: product of the first two elements in 'arr'.
        arr  [  0  ]   *   arr  [  1  ]

        +   " "   // A space to separate the two results.

        +   (
            // The second value: sum of the first two elements, multiplied by 2.
            arr  [  0  ]   +   arr  [  1  ]
        )   *   2

    )  ; // End of console.log call.

} // End of the Main function definition.


// This section executes the 'Main' function.
// It reads input from standard input using Node.js 'fs' module.
Main  (

    // Get the 'fs' (file system) module.
    require (  "fs"  )

        // Read the entire content of standard input synchronously.
        .  readFileSync (  "/dev/stdin"  )

)  ; // End of Main function invocation.