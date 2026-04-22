"use strict" /* This directive enforces stricter parsing and error handling in JavaScript. */ ;


// This is the primary function where the program logic resides.
function   main (   arg   )
{
    // First, we take the input string 'arg' and split it into an array of lines.
    // Each line is separated by a newline character.
    var   input = arg.split(   "\n"   )   ;

    // The first element of the 'input' array (input[0]) is assumed to be
    // a number representing the count of subsequent data elements.
    var   retu = input[   0   ]   ;

    // An empty array named 'kazu' is initialized. This array will store
    // the numeric data extracted from the input.
    var   kazu = [   ]   ;


    // This loop iterates from 1 up to the value specified by 'retu'.
    // It's used to populate the 'kazu' array with data from 'input'.
    for   (   var   i = 1   ;   retu   >=   i   ;   i ++   )
    {
        // Each element from 'input' (starting from index 1) is added
        // to the 'kazu' array.
        kazu.push(   input[   i   ]   )   ;
    }


    /*
     * The following loop processes the 'kazu' array.
     * In each iteration, it removes one element from a copy of the array
     * and then finds the maximum value among the remaining elements.
     */
    for   (   var   x = 0   ,   len = kazu.length   ;   x   <   len   ;   ++x   )
    {
        // A shallow copy of the 'kazu' array is created.
        // This ensures that the original 'kazu' array is not modified
        // during the element removal process.
        var   kazu2 = kazu.slice(   0   ,   kazu.length   )   ;

        // The element at the current index 'x' is removed from 'kazu2'.
        // The '1' indicates that only one element should be removed.
        kazu2.splice(   x   ,   1   )   ;

        // The maximum value within the modified 'kazu2' array is calculated
        // and then printed to the console.
        // Math.max.apply is used to pass array elements as individual arguments to Math.max.
        console.log(   Math.max.apply(   null   ,   kazu2   )   )   ;
    }

} // End of the 'main' function.


// This line executes the 'main' function.
// It reads the content of '/dev/stdin' (standard input) as a UTF-8 string
// using Node.js's 'fs' module and passes it as the 'arg' parameter to 'main'.
main(   require(   'fs'   )   .readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;