/*
 * This JavaScript program handles asynchronous input from standard input
 * to perform string manipulations and calculations.
 * It reads a single line, processes substrings, and outputs a calculated result.
 * This code demonstrates event-driven programming with Node.js `process.stdin`.
 */


// Declare and initialize a variable to accumulate all incoming data from stdin.
var    input    =    ''    ;


// Begin listening for input on the standard input stream.
process .   stdin   .   resume   (   )   ;


// Set the character encoding for the standard input stream to 'utf8'.
process   .   stdin   .   setEncoding   (   'utf8'   )   ;


// Attach an event listener for the 'data' event.
// This callback function is executed whenever new data chunks are available.
process .   stdin   .   on   (   'data'   ,    (   chunk   )   =>     {
    // Append the received data chunk to the 'input' string.
    input   +=   chunk   ;
}   )   ;


// Attach an event listener for the 'end' event.
// This callback function runs once all input data has been received.
process .   stdin   .   on   (   'end'   ,    (   )   =>     {

    // Process the accumulated input:
    // 1. Split the input string by newline characters.
    // 2. Take the first line (index 0).
    // 3. Remove the last character from that line (often a newline character).
    var    text    =    input .   split   (   "\n"   )   [   0   ]   .   slice   (   0   ,   -1   )   ;

    // The original code had this line commented out. It remains commented.
    //console.log(text);

    // Calculate 'herftext' by slicing 'text' from the beginning up to
    // a point determined by half its length, rounded down.
    var    herftext    =    text .   slice   (   0   ,   -Math .   floor   (   text .   length   /   2   )   )   ;

    // Initialize two empty arrays. 'ary' will store counts, 'ary2' will store substrings.
    var    ary    =    [   ]   ;
    var    ary2    =    [   ]   ;

    // Loop as long as the length of 'herftext' is not equal to 2.
    while    (   herftext .   length    !=    2   )     {
        // Call the 'check' function with 'text' and 'herftext' and push the result into 'ary'.
        ary .   push   (   check   (   text   ,   herftext   )   )   ;
        // Push the current 'herftext' value into 'ary2'.
        ary2 .   push   (   herftext   )   ;
        // Shorten 'herftext' by removing its last character for the next iteration.
        herftext    =    herftext .   slice   (   0   ,   -1   )   ;
    }

    // Find the maximum value within the 'ary' array.
    var    max    =    Math .   max .   apply   (   null   ,   ary   )   ;

    // Calculate and print the final result:
    // The length of the 'herftext' string (from 'ary2') that corresponds to the 'max' value,
    // multiplied by the 'max' value itself.
    console .   log   (   ary2   [   ary .   indexOf   (   max   )   ]   .   length   *   max   )   ;

}   )   ;


// Define a helper function named 'check'.
// This function counts how many times a 'pattern' ('pat') repeats
// consecutively from the beginning of a 'string' ('str').
function    check   (   str   ,   pat   )     {
    // Initialize a counter 'u' to zero. This will track the number of repetitions.
    var    u    =    0   ;
    // Loop condition: continues as long as the substring of 'str' (starting at u*pat.length
    // and with length pat.length) is exactly equal to 'pat'.
    while    (   str .   slice   (   u   *   pat .   length   ,   u   *   pat .   length   +   pat .   length   )    ==    pat   )     {
        // If a match is found, increment the counter.
        u   ++   ;
    }
    // Return the final count of consecutive pattern occurrences.
    return    u   ;
}