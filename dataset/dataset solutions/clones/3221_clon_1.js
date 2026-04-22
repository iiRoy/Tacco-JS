/*
 * This is a JavaScript program, designed to process numerical data.
 * It reads input, performs sorting, and makes a comparison.
 * The main logic is encapsulated within the 'main' function.
 */
function   main (   arg   )   {
    // The input 'arg' is initially a single string.
    // We split it into an array of strings based on newline characters.
    arg   =   arg.split (   "\n"   )   ;

    // The first element of the split array (arg[0]) represents 'N'.
    // We convert this string to a number.
    var   N   =   Number (   arg[0]   )   ;

    // The second element (arg[1]) is a space-separated string of numbers.
    // We split it by spaces and then use the 'map' function to convert each part into a number.
    var   L   =   arg[1].split (   " "   ) .map (   e   =>   Number (   e   )   )   ;

    // Sort the array 'L' in ascending numerical order.
    // The comparison function (a - b) ensures proper numeric sorting.
    L   =   L.sort (   (   a ,   b   )   =>   (   a   -   b   )   )   ;

    // After sorting, the largest element is at the end of the array.
    // We remove this largest element from 'L' and store it in 'max'.
    var   max   =   L.pop (   )   ;

    // Initialize a variable 'sum' to hold the total of the remaining elements.
    var   sum   =   0   ;

    // Iterate over each remaining element 'e' in the array 'L'.
    // Add the value of 'e' to 'sum'.
    L.forEach (   e   =>   {
        // Increment 'sum' by the current element.
        sum   +=   e   ;
    }   )   ;

    // The following line was a debug statement in the original code.
    // console.log (   [   sum   ,   max   ]   )   ; // This line is intentionally commented out.

    // Perform a conditional check: Is the 'max' element less than the 'sum' of other elements?
    if   (   max   <   sum   )   {
        // If the condition holds true, print "Yes" to the console.
        console.log (   "Yes"   )   ;
    }   else   {
        // If the condition is false, print "No" to the console.
        console.log (   "No"   )   ;
    }
}

// This line executes the 'main' function.
// It reads the entire content of the standard input stream ('/dev/stdin')
// as a UTF-8 encoded string and passes it as the 'arg' parameter to 'main'.
main (   require (   'fs'   ) .readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;