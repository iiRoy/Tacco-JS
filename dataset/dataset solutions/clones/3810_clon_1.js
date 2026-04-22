/*
 * This is a JavaScript program designed to process input from stdin.
 * It defines a main function to handle the logic.
 */
function     Main   (  s  )   {
    // The input string 's' is expected to contain space-separated values.
    // We split the string into an array of substrings based on the space delimiter.
    s   =   s.split(" ");


    // Parse the first three elements of the array as numbers.
    // The unary plus operator (+) is used for type coercion to number.
    var   a   =   +s[  0  ];
    var   b   =   +s[  1  ];
    var   c   =   +s[  2  ]; // This variable 'c' is declared but not used in the current logic.


    // The fourth element is treated as a string 'k'.
    var   k   =   s[  3  ];
    // We extract the last character of string 'k' and parse it as an integer.
    // This assumes 'k' is a string of digits or contains a digit at the end.
    var   k2   =   parseInt(  k[  k.length   -   1  ]  );


    // Based on the parity of 'k2', we perform either (a - b) or (b - a).
    // If k2 is even, calculate a - b. Otherwise (if k2 is odd), calculate b - a.
    console.log(  k2   %   2   ===   0   ?   a   -   b   :   b   -   a  )  ;

} // End of the Main function definition.


// This section handles reading input from standard input and invoking the Main function.
// It uses Node.js 'fs' module to read the file synchronously.
Main  (  require("fs").readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ; // Call the main function with the read content.