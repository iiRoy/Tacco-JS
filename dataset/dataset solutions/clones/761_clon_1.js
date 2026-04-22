/*
 * This JavaScript program reads input from standard input,
 * processes a series of test cases, and determines a winner
 * based on specific criteria or declares a tie.
 * It simulates a voting or counting process where elements
 * are tallied and a leader is identified if their lead is
 * insurmountable given remaining votes.
 */

// Import the 'fs' module, which provides an API for interacting with the file system.
// Specifically, it's used here to read the standard input synchronously.
var input = require(   'fs'   ).readFileSync(   '/dev/stdin'   ,   'utf8'   );


// Process the raw input string:
// 1. `.trim()` removes leading/trailing whitespace.
// 2. `.split("\n")` divides the string into an array of substrings,
//    using the newline character as a separator. Each element in 'arr'
//    will be a line from the input.
var arr = input   .trim()   .split(   "\n"   );


// This is the main processing loop. It continues indefinitely until
// a specific break condition is met within its body.
while   (   true   )   {

    // Extract the first element from the 'arr' array using `shift()`.
    // This element represents 'n', the number of participants/items for the current test case.
    // The `- 0` operation is a common JavaScript trick to explicitly convert a string to a number.
    var   n   =   arr.shift()   -   0   ;


    // Check if the value of 'n' is 0.
    // A value of 0 typically signifies the end of input or test cases.
    if   (   n   ==   0   )   {
        // If 'n' is 0, break out of the `while (true)` loop, terminating the program.
        break   ;
    }


    // Extract the next line from 'arr', which contains the actual data for this test case.
    // `.split(" ")` divides this string into an array of elements, using a space as a separator.
    var   a   =   arr.shift()   .split(   " "   );


    // Initialize a boolean flag named `flag` to `false`.
    // This flag will be used to track whether a definitive winner has been found
    // for the current test case.
    var   flag   =   false   ;


    // Initialize an empty object named `obj`.
    // This object will serve as a frequency map (or hash map/dictionary)
    // to store the counts of each unique element encountered in array `a`.
    var   obj   =   {   }   ;


    // This `for` loop iterates through each element of the array `a`
    // for the current test case, from index 0 up to (but not including) 'n'.
    for   (   var   i   =   0   ;   i   <   n   ;   i++   )   {

        // Increment the count for the current element `a[i]` in the `obj` map.
        // If `obj[a[i]]` is undefined (i.e., the element is encountered for the first time),
        // `obj[a[i]] + 1` would result in `NaN`. The `|| 1` ensures that if the
        // left side is falsy (like `NaN`), the value becomes `1`.
        obj[   a[i]   ]   =   obj[   a[i]   ]   +   1   ||   1   ;


        // Declare an empty array `s`. This array will temporarily hold
        // the counts and corresponding keys from the `obj` map.
        var   s   =   [   ]   ;


        // This `for...in` loop iterates over the keys (properties) of the `obj` object.
        for   (   var   k   in   obj   )   {
            // For each key `k`, push an array `[count, key]` into the `s` array.
            // This transforms the object into an array of arrays, suitable for sorting.
            s.push(   [   obj[k]   ,   k   ]   )   ;
        }


        // Sort the `s` array. The custom comparison function `(a, b) => a[0] < b[0]`
        // sorts the elements in descending order based on their counts (the first element `[0]`
        // of each inner array). So, the element with the highest count will be at `s[0]`.
        s.sort(   function   (   a   ,   b   )   {
            return   a[0]   <   b[0]   ;
        }   )   ;


        // Calculate `nokori` (remaining), which is the number of elements in `a`
        // that have not yet been processed in the current `for` loop.
        var   nokori   =   a.length   -   (   i   +   1   )   ;


        // If there is only one distinct element counted so far (`s.length == 1`),
        // we need to set a placeholder for `s[1]` to prevent errors in subsequent
        // comparisons (e.g., `s[1][0]`). We assign `[0]` to simulate a second place
        // with zero votes.
        if   (   s.length   ==   1   )   {
            s[1]   =   [   0   ]   ;
        }


        // Check if the count of the leading element (`s[0][0]`) is equal to
        // the count of the second-leading element (`s[1][0]`).
        // If they are tied at the top, no winner can be declared yet, so continue
        // to the next iteration of the inner loop.
        if   (   s[0][0]   ==   s[1][0]   )   {
            continue   ;
        }


        // This is the core logic to determine an early winner.
        // It checks if the leading element's count (`s[0][0]`) is strictly greater than
        // the second-leading element's count (`s[1][0]`) plus all the `nokori` (remaining) votes.
        // If this condition is true, it means the leader's lead is mathematically insurmountable,
        // even if all remaining votes went to the second-place contender.
        if   (   s[0][0]   >   s[1][0]   +   nokori   )   {
            // If an insurmountable lead is found, print the key (identifier) of the winner
            // (`s[0][1]`) and the current iteration number (`i + 1`), which represents
            // how many elements were processed when the winner was determined.
            console.log(   s[0][1]   ,   i   +   1   )   ;

            // Set the `flag` to `true` to indicate that a winner has been found.
            flag   =   true   ;

            // Break out of the inner `for` loop, as the winner is already decided.
            break   ;
        }
    }


    // After the inner `for` loop completes (either by breaking or finishing all iterations),
    // check the `flag` variable.
    // If `flag` is still `false`, it means no winner was determined with an insurmountable lead.
    if   (   flag   ==   false   )   {
        // In this case, the result is a "TIE" or no clear winner could be declared early.
        console.log(   "TIE"   )   ;
    }
}
// End of the program.