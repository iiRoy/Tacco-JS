/*
 * This is a JavaScript program designed to read pairs of numbers
 * from standard input, compare them, and then print them
 * in ascending order. The program terminates when it encounters
 * a line where the first character is '0'.
 */
function     Main (   input   )
{
    // The main processing function begins here.

    // First, split the entire input string into an array of lines.
    // Each element in the 'input' array will now be a single line from the original input.
    input       =       input.split(   "\n"   )   ;


    // Initialize a loop counter 'i' to 0.
    // The loop continues as long as the first character of the current line (input[i][0])
    // is not equal to the string "0".
    // After each iteration, 'i' is incremented.
    for (   var   i   =   0   ;
            input[   i   ][   0   ]   !=   "0"   ;
            i   ++   )
    {
        /*
         * Inside the loop, we process each line.
         * 1. Split the current line by spaces to get an array of strings.
         * 2. Use the 'map(Number)' function to convert each string in the array to a numeric type.
         *    This resulting array of numbers is stored in 'arr'.
         */
        var     arr     =     input[   i   ]
                                    .split(   "   "   )
                                    .map(   Number   )   ;


        // Extract the two numbers from the 'arr' array.
        // 'a' gets the first number (at index 0).
        // 'b' gets the second number (at index 1).
        var     a     =     arr[   0   ]   ;
        var     b     =     arr[   1   ]   ;

        // Now, we compare 'a' and 'b' to determine their order.
        if  (   a     >     b   )
        {
            // If 'a' is strictly greater than 'b',
            // we print 'b' followed by a space, then 'a'.
            console.log(   b   +   "   "   +   a   )   ;
        }
        else
        {
            // Otherwise (if 'a' is less than or equal to 'b'),
            // we print 'a' followed by a space, then 'b'.
            console.log(   a   +   "   "   +   b   )   ;
        }
    }   // The 'for' loop finishes here.

}   // The 'Main' function definition ends here.


// This section of the code is responsible for reading the input and
// calling the 'Main' function with that input.
// 1. 'require('fs')' imports the Node.js file system module.
// 2. '.readFileSync('/dev/stdin', 'utf8')' reads the entire content
//    of the standard input stream ('/dev/stdin') as a UTF-8 encoded string.
// 3. This string is then passed as the 'input' argument to the 'Main' function.
Main(   require(   'fs'   )
            .readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;