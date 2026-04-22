// This JavaScript code processes input from the command line.

var   reader   =   require ( 'readline' ) . createInterface ( {
    input   :   process . stdin ,   // Standard input stream for reading lines.
    output   :   process . stdout     // Standard output stream for writing, though not used directly for output here.
} ) ;


// This array will store all lines received from the standard input.
var   args   =   [ ] ;


// Event listener: This function executes every time a new line of input is received.
reader . on ( 'line' ,   function   ( input )   {
  // Add the current input line to the 'args' array.
  args . push ( input ) ;
} ) ;


// Event listener: This function executes once the input stream has ended (e.g., user presses Ctrl+D).
reader . on ( 'close' ,   function   ( )   {
    // The first line of input (args[0]) is expected to be a string of space-separated numbers.
    var   str   =   args [ 0 ] . split ( " " ) ;

    // Declare an array to hold the numeric values after parsing.
    var   num   =   [ ] ;

    // Initialize a counter variable. This will store the final result.
    var   count   =   0 ;

    // Loop through the 'str' array to convert string elements to integers.
    for   ( var   i   =   0 ;   i   <   str . length ;   i ++ )   {
        // Parse each string element into an integer and store it in the 'num' array.
        num [ i ]   =   parseInt ( str [ i ] ) ;
    }

    // Second loop: Iterate from the first number (num[0]) up to the second number (num[1]), inclusive.
    for   ( var   i   =   num [ 0 ] ;   i   <=   num [ 1 ] ;   i ++ )   {
        // Check if the current number 'i' is perfectly divisible by the third number (num[2]).
        // The condition `!(i % num[2])` is true if the remainder is 0.
        if   ( ! ( i   %   num [ 2 ] ) )   {
            // If divisible, increment the counter.
            count ++ ;
        }
    }

    // Finally, print the total count of numbers that met the divisibility criterion.
    console . log ( count ) ;
} ) ;
// End of script execution.