function    main   (  input  )    {
    // This variable will store the integer value of the first line of input.
    var   line1    =    parseInt  (  input  [  0  ]  )    ;

    /*
     * The 'ans' variable is a boolean flag, initialized to false.
     * It will be set to true if any odd number is found in the input.
     */
    var   ans   =   false   ;

    // Loop through the input array, starting from the second element (index 1).
    // The loop continues as long as 'i' is less than the total length of the input array.
    for   (  var   i   =   1   ;   i   <   input.length   ;   i++  )    {
        // Parse the current element of the input array into an integer 'n'.
        var   n    =    parseInt  (  input  [  i  ]  )    ;

        // Check if the integer 'n' is an odd number.
        // The modulo operator (%) returns the remainder of the division.
        if   (  n   %   2   ===   1  )
            // If 'n' is odd, set the 'ans' flag to true.
            // Note the intentional extra semicolon, allowed in Type I clones.
            ans   =   true   ;   ;
    }

    // After checking all numbers, log 'first' if 'ans' is true (an odd number was found),
    // otherwise log 'second' (no odd numbers were found).
    console.log   (  ans   ?   'first'   :   'second'  )    ;
}


/*
 * The 'parse' function is a utility that takes a string line
 * and transforms it into an array of integers.
 * It assumes numbers in the line are space-separated.
 */
function    parse   (  line  )    {
    // Initialize an empty array to hold the parsed integer results.
    var   ret    =    [  ]    ;

    // Split the input 'line' string into an array of strings, using space as a delimiter.
    var   arr    =    line.split  (  ' '  )    ;

    // Iterate over each string element in the 'arr' array.
    for   (  var   i    =    0   ;   i    <    arr.length   ;   i++  )   {
        // Convert the current string element to an integer and push it into the 'ret' array.
        ret.push   (  parseInt  (  arr  [  i  ]  )  )    ;
    }
    // Return the array containing all the parsed integers.
    return   ret   ;
}

// Declare a global variable to accumulate all incoming standard input data.
var   input    =    ''   ;

// Resume the standard input stream, allowing it to emit data.
process.stdin.resume   (  )    ;

// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding   (  'utf8'  )    ;

/*
 * Register an event listener for the 'data' event on the standard input stream.
 * This function will be called whenever a chunk of data is received.
 */
process.stdin.on   (  'data'   ,   function   (  chunk  )    {
    // Append the received 'chunk' of data to the global 'input' string.
    input   +=   chunk   ;
}  )    ;

/*
 * Register an event listener for the 'end' event on the standard input stream.
 * This function is executed once all input has been received.
 */
process.stdin.on   (  'end'   ,   function   (  )    {
    // Split the accumulated 'input' string into an array of strings,
    // using the newline character as a delimiter. This effectively creates
    // an array where each element is a line from the input.
    input    =    input.split  (  '\n'  )    ;

    // Call the main processing function with the prepared array of input lines.
    main   (  input  )    ;
}  )    ;