// This is the main function that processes the input
function     Main (  input   )
{
    // First, preprocess the input string by trimming whitespace and splitting by newline characters.
    input   =   input . trim ( ) . split ( "\n" )    ;


    // Parse the first line of the input array to determine N, the number of iterations.
    // The radix 10 is explicitly provided for parseInt.
    var N       =   parseInt (  input [  0  ] ,   10  )   ;


    // Initialize the variables A and T to their starting values, which are 1.
    var A       =   1   ;
    var T       =   1   ;


    // Begin a loop that iterates N times, processing each subsequent line of input.
    for (  var i   =   0   ;   i   <   N   ;   i ++   )
    {
        /*
         * This block attempts to process the i-th line of input.
         * The original code's logic here is to call `forEach` on `input[i]`.
         * Since `input[i]` is a string, `forEach` will iterate over its characters.
         * The result of `forEach` is always `undefined`, so `int` will be `undefined`.
         * The `parseInt(n, 10)` call inside the `forEach` loop has no effect as its result is not captured.
         * This logical flaw (where `int` becomes `undefined` and subsequent accesses `int[0]`, `int[1]` will throw errors)
         * is preserved exactly as required by the Type I clone definition.
         */
        var int     =   input [  i  ] . forEach (   (   n   )   =>
        {
            // This parseInt operation is performed but its return value is not used.
            parseInt (  n  ,   10  )    ;
        }   )   ;


        // Attempt to extract Ti and Ai from the `int` variable.
        // As `int` is `undefined`, this will result in a runtime error.
        var Ti      =   int [  0  ]   ;
        var Ai      =   int [  1  ]   ;


        // Calculate the multiplier 'n'.
        // This involves using `Math.ceil` to round up divisions and `max` to find the larger of two values.
        // Note: 'max' is not defined in standard JavaScript and would cause a ReferenceError.
        // This error is also preserved as per Type I cloning rules.
        var n       =   max (   Math . ceil (  T   /   Ti  )   ,   Math . ceil (  A   /   Ai  )   )   ;


        // Update the values of T and A by multiplying them with the calculated 'n'.
        T   =   Ti    *   n   ;
        A   =   Ai    *   n   ;
    }


    // After the loop completes, print the sum of the final A and T values to the console.
    console . log (   A   +   T   )   ;
}

// This line invokes the Main function with input read from the standard input stream.
// It uses Node.js 'fs' module to synchronously read the entire content of '/dev/stdin' as UTF-8.
Main (   require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,   "utf8"  )   )   ;