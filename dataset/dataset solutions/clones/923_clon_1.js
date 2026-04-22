/*
 * This JavaScript code processes input from /dev/stdin.
 * It defines and utilizes a recursive function named 'saiki'.
 * The purpose of this clone is to demonstrate Type I code cloning,
 * where only whitespace and comments are altered.
 */


var    input    =    require('fs') . readFileSync('/dev/stdin',    'utf8')    ; // Reads the entire content of standard input


// This section handles the initial parsing of the input data.
// The 'input' variable now holds the raw string from stdin.


var arr = input . trim() . split("\n"); /* First, trim whitespace, then split by newlines
                                           to get an array of lines. */


// The 'arr' array now contains individual lines from the input.


var n    =    arr.shift()    ; // The first line is assigned to 'n' and removed from 'arr'.


var p = arr.shift().split(" "); /* The second line is split by spaces and assigned to 'p'.
                                    This array 'p' will be the primary argument for the recursive function. */


/*
 * Definition of the recursive function 'saiki'.
 * This function processes an array of strings, presumably boolean values ('T' or 'F').
 */
var saiki = function(p) {

    // Extract the first two elements from the current 'p' array.
    var a = p[0];
    var b = p[1];


    // Create a new array 'p' by slicing off the first two elements.
    p = p.slice(2);


    /*
     * The following 'if-else if' chain implements the core logic.
     * It simulates a boolean operation (AND/OR/XOR/NAND/NOR/XNOR) or a custom logic.
     * The outcome depends on 'a' and 'b', and whether 'p' still has elements.
     */

    if (a == "T" && b == "T" && p.length != 0) {
        // If both are 'T' and array not empty, unshift 'T'.
        p.unshift("T");
    }
    else
    if (a == "T" && b == "F" && p.length != 0) {
        // If 'T' and 'F' and array not empty, unshift 'F'.
        p.unshift("F");
    }
    else
    if (a == "F" && b == "T" && p.length != 0) {
        // If 'F' and 'T' and array not empty, unshift 'T'.
        p.unshift("T");
    }
    else
    if (a == "F" && b == "F" && p.length != 0) {
        // If both are 'F' and array not empty, unshift 'T'.
        p.unshift("T");
    }

    // These are the base cases for the recursion, when 'p' becomes empty.
    else if (a == "T" && b == "T" && p.length == 0) {
        console.log("T"); // Print 'T' and return.
        return;
    }
    else if (a == "T" && b == "F" && p.length == 0) {
        console.log("F"); // Print 'F' and return.
        return;
    }
    else if (a == "F" && b == "T" && p.length == 0) {
        console.log("T"); // Print 'T' and return.
        return;
    }
    else if (a == "F" && b == "F" && p.length == 0) {
        console.log("T"); // Print 'T' and return.
        return;
    }

    // If none of the base cases were met, perform the recursive call.
    saiki(p);

}; // End of the 'saiki' function definition.


/*
 * Initial invocation of the recursive function 'saiki'
 * with the processed 'p' array from the input.
 */
saiki(p);

// The script concludes after the recursion unwinds and a value is printed to console.